console.log("[src] server.js running...");

const fastify = require("fastify")({
  logger: true,
  bodyLimit: 64 * 1024 // 64KB - limits impact of large payloads
});

const path = require('path');
const dbFunctions = require("../scripts/database.js");
const getData = require("../scripts/processData.js");

const startServer = async () => {
  try {
    await dbFunctions.initializeDatabase();

    // Central error formatting (validation + internal errors)
    fastify.setErrorHandler((err, request, reply) => {
      const statusCode = err.statusCode || (err.validation ? 400 : 500);
      const payload = {
        success: false,
        error: {
          message: statusCode >= 500 ? "Internal Server Error" : (err.message || "Bad Request"),
          statusCode,
        },
      };
      if (err.validation) {
        payload.error.validation = err.validation;
      }
      if (statusCode >= 500) {
        request.log.error(err);
      }
      reply.code(statusCode).send(payload);
    });

    // Request timing + slow request logging
    const SLOW_REQUEST_MS = Number(process.env.SLOW_REQUEST_MS) || 250;
    fastify.addHook("onRequest", (request, _reply, done) => {
      request.startTime = Date.now();
      done();
    });
    fastify.addHook("onResponse", (request, reply, done) => {
      const start = request.startTime || Date.now();
      const ms = Date.now() - start;
      if (ms >= SLOW_REQUEST_MS) {
        request.log.warn(
          { req: { method: request.method, url: request.url }, res: { statusCode: reply.statusCode }, responseTimeMs: ms },
          "slow request"
        );
      }
      done();
    });

    // Flush any pending debounced DB saves on shutdown
    const shutdown = async (signal) => {
      try {
        dbFunctions.flushSaveDb?.();
        await fastify.close();
      } finally {
        process.exit(0);
      }
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    
    // Response compression (gzip/brotli where supported)
    fastify.register(require("@fastify/compress"));

    // Register static files
    fastify.register(require("@fastify/static"), {
      root: path.join(__dirname, '../Website'),
      prefix: '/',
    });

    // Register routes
    const indexRouter = require('./routes/index');
    fastify.register(indexRouter);

    fastify.register(require("@fastify/formbody"));

    // OnRoute hook to list endpoints
    const routes = { endpoints: [] };
    fastify.addHook("onRoute", routeOptions => {
      routes.endpoints.push(routeOptions.method + " " + routeOptions.path);
    });

    // Register route modules
    const apiPrefix = "/api/v1";
    fastify.register(require('../scripts/buildings.js'), { prefix: apiPrefix });
    fastify.register(require('../scripts/reviews.js'), { prefix: apiPrefix });
    fastify.register(require('../scripts/report.js'), { prefix: apiPrefix });

    // Start the server
    const address = await fastify.listen({ port: 5000 });
    console.log(`Server started at ${address}`);

    // Run data processing without blocking request handling
    setImmediate(() => {
      getData.runDataProcessing().catch((err) => {
        fastify.log.error({ err }, "data processing failed");
      });
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
