const dbFunctions = require("./database.js");
const { sanitizeBody } = require("./sanitize.js");
const { createTtlCache } = require("../src/utils/ttlCache.js");

const namesCache = createTtlCache({ ttlMs: Number(process.env.BUILDING_NAMES_CACHE_TTL_MS) || 10_000, maxEntries: 50 });
const buildingsPageCache = createTtlCache({ ttlMs: Number(process.env.BUILDINGS_PAGE_CACHE_TTL_MS) || 5_000, maxEntries: 200 });

const insertBuildingSchema = {
  body: {
    type: 'object',
    required: ['name', 'x_coord', 'y_coord', 'time_opens', 'time_closes'],
    properties: {
      name: { type: 'string', minLength: 1 },
      x_coord: { type: 'number' },
      y_coord: { type: 'number' },
      time_opens: { type: 'string' },
      time_closes: { type: 'string' },
      num_snack_machines: { type: 'integer', minimum: 0 },
      num_drink_machines: { type: 'integer', minimum: 0 },
      num_ratings: { type: 'integer', minimum: 0 },
      average_ratings: { type: 'number', minimum: 0, maximum: 5 },
      needs_service: { type: 'boolean' }
    }
  }
};

const routes = (fastify, options, done) => {
  
  // Paginated full building rows: ?limit=&offset=
  fastify.get("/building", async (request, reply) => {
    try {
      const limit = Math.min(Math.max(parseInt(request.query.limit, 10) || 50, 1), 500);
      const offset = Math.max(parseInt(request.query.offset, 10) || 0, 0);
      const cacheKey = `${limit}:${offset}`;
      const cached = buildingsPageCache.get(cacheKey);
      if (cached) return reply.send(cached);

      const total = dbFunctions.countBuildings();
      const items = dbFunctions.fetchBuildingsPage(limit, offset);
      const payload = {
        success: true,
        data: { items },
        meta: { total, limit, offset, hasMore: offset + items.length < total },
      };
      buildingsPageCache.set(cacheKey, payload);
      reply.send({
        ...payload,
      });
    } catch (err) {
      reply.status(500).send({ success: false, error: { message: "Failed to fetch buildings" } });
    }
  });

  // Paginated building names: ?limit=&offset= (use GET /building/name/:name for full row — replaces /x_coord, /y_coord, etc.)
  fastify.get("/building/names", async (request, reply) => {
    try {
      const limit = Math.min(Math.max(parseInt(request.query.limit, 10) || 100, 1), 500);
      const offset = Math.max(parseInt(request.query.offset, 10) || 0, 0);
      const cacheKey = `${limit}:${offset}`;
      const cached = namesCache.get(cacheKey);
      if (cached) return reply.send(cached);

      const total = dbFunctions.countBuildings();
      const items = dbFunctions.fetchBuildingNamesPage(limit, offset);
      const payload = {
        success: true,
        data: { items },
        meta: { total, limit, offset, hasMore: offset + items.length < total },
      };
      namesCache.set(cacheKey, payload);
      reply.send({
        ...payload,
      });
    } catch (err) {
      reply.status(500).send({ success: false, error: { message: "Failed to fetch buildings" } });
    }
  });

  // Single canonical endpoint: full building by name (includes x_coord, y_coord, machine counts, id, …)
  fastify.get("/building/name/:name", async (request, reply) => {
    try {
      const {name} = request.params;
      const row = dbFunctions.fetchSpecificBuildingByName(name);
      if (!row) {
        return reply.status(404).send({ success: false, error: { message: `Building '${name}' not found.` } });
      }
      reply.send({ success: true, data: row });
    } catch (err) {
      reply.status(500).send({ success: false, error: { message: "Failed to fetch building row by name." } });
    }
  });
  
  //route for fetchSpecificBuildingByKey
  fastify.get("/building/id/:id", async (request, reply) => {
    try {
      const {id} = request.params;
      const row = dbFunctions.fetchSpecificBuildingByKey(id);
      if (!row) {
        return reply.status(404).send({ success: false, error: { message: `Building with id '${id}' not found.` } });
      }
      reply.send({ success: true, data: row });
    } catch (err) {
      reply.status(500).send({ success: false, error: { message: "Failed to fetch building row by id." } });
    }
  });

  //route for inserting a new building in table 
  fastify.post("/building", { schema: insertBuildingSchema }, async (request, reply) => {
    try {
      const body = sanitizeBody(request.body, ["name", "time_opens", "time_closes"]);
      const {name, x_coord, y_coord, time_opens, time_closes, num_snack_machines, num_drink_machines, num_ratings, average_ratings, needs_service} = body;
      await dbFunctions.insertBuilding(name, x_coord, y_coord, time_opens, time_closes, num_snack_machines, num_drink_machines, num_ratings, average_ratings, needs_service);
      namesCache.clear();
      buildingsPageCache.clear();
      reply.status(201).send({ success: true, data: { created: true } });
    } catch (err) {
      reply.status(500).send({ success: false, error: { message: "Failed to insert new building object." } });
    }
  });
  
  done();
  
};

module.exports = routes;
