const dbFunctions = require("./database.js");
const { sanitizeBody } = require("./sanitize.js");

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
  
  //route to fetchAllBuildingNames
  fastify.get("/building/names", async (request, reply) => {
    try {
      const buildings = dbFunctions.fetchAllBuildingNames();
      reply.send(buildings);
    } catch (err) {
      reply.status(500).send({error: "Failed to fetch buildings"});
    }
  });
  
  //route to fetchSpecificBuildingByName(name)
  fastify.get("/building/name/:name", async (request, reply) => {
    try {
      const {name} = request.params;
      const row = dbFunctions.fetchSpecificBuildingByName(name);
      if (!row) {
        return reply.status(404).send({error: `Building '${name}' not found.`});
      }
      reply.send(row);
    } catch (err) {
      reply.status(500).send({error: "Failed to fetch building row by name."});
    }
  });
  
  //route for fetchSpecificBuildingByKey
  fastify.get("/building/id/:id", async (request, reply) => {
    try {
      const {id} = request.params;
      const row = dbFunctions.fetchSpecificBuildingByKey(id);
      if (!row) {
        return reply.status(404).send({error: `Building with id '${id}' not found.`});
      }
      reply.send(row);
    } catch (err) {
      reply.status(500).send({error: "Failed to fetch building row by id."});
    }
  });
  
  //route to get building ID by name
  fastify.get("/building/name/:name/id", async (request, reply) => {
    try {
      const {name} = request.params;
      const row = dbFunctions.getBuildingIDByName(name);
      if (!row) {
        return reply.status(404).send({error: `Building '${name}' not found.`});
      }
      reply.send(row);
    } catch (err) {
      reply.status(500).send({error: "Failed to fetch building id by name."});
    }
  });
  
  //route for getting the x_coord
  fastify.get("/building/x_coord/:name", async (request, reply) => {
    try {
      const {name} = request.params;
      const row = dbFunctions.getX(name);
      if (!row) {
        return reply.status(404).send({error: `Building '${name}' not found.`});
      }
      reply.send(row);
    } catch (err) {
      reply.status(500).send({error: "Failed to get x_coord."});
    }
  });
  
  //route for getting the y_coord
  fastify.get("/building/y_coord/:name", async (request, reply) => {
    try {
      const {name} = request.params;
      const row = dbFunctions.getY(name);
      if (!row) {
        return reply.status(404).send({error: `Building '${name}' not found.`});
      }
      reply.send(row);
    } catch (err) {
      reply.status(500).send({error: "Failed to get y_coord."});
    }
  });
  
  //route for getting number of drink machines
  fastify.get("/building/num_drink_machines/:name", async (request, reply) => {
    try {
      const {name} = request.params;
      const row = dbFunctions.getNumDrinkMachines(name);
      if (!row) {
        return reply.status(404).send({error: `Building '${name}' not found.`});
      }
      reply.send(row);
    } catch (err) {
      reply.status(500).send({error: "Failed to get num_drink_machines."});
    }
  });
  
  //route for getting number of snack machines
  fastify.get("/building/num_snack_machines/:name", async (request, reply) => {
    try {
      const {name} = request.params;
      const row = dbFunctions.getNumSnackMachines(name);
      if (!row) {
        return reply.status(404).send({error: `Building '${name}' not found.`});
      }
      reply.send(row);
    } catch (err) {
      reply.status(500).send({error: "Failed to get num_snack_machines."});
    }
  });
  
  //route for inserting a new building in table 
  fastify.post("/building", { schema: insertBuildingSchema }, async (request, reply) => {
    try {
      const body = sanitizeBody(request.body, ["name", "time_opens", "time_closes"]);
      const {name, x_coord, y_coord, time_opens, time_closes, num_snack_machines, num_drink_machines, num_ratings, average_ratings, needs_service} = body;
      await dbFunctions.insertBuilding(name, x_coord, y_coord, time_opens, time_closes, num_snack_machines, num_drink_machines, num_ratings, average_ratings, needs_service);
      reply.status(201).send({success: true});
    } catch (err) {
      reply.status(500).send({error: "Failed to insert new building object."});
    }
  });
  
  done();
  
};

module.exports = routes;
