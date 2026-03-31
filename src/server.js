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
    fastify.register(require('../scripts/buildings.js'));
    fastify.register(require('../scripts/reviews.js'));
    fastify.register(require('../scripts/report.js'));

    // Start the server
    const address = await fastify.listen({ port: 5000 });
    console.log(`Server started at ${address}`);

    // Run data processing
    await getData.runDataProcessing();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
