const dbFunctions = require("./database.js");

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
      reply.send(row);
    } catch (err) {
      reply.status(500).send({error: "Failed to get num_snack_machines."});
    }
  });
  
  //route for inserting a new building in table 
  fastify.post("/building", async (request, reply) => {
    try {
      const {name, x_coord, y_coord, time_opens, time_closes, num_snack_machines, num_drink_machines, num_ratings, average_ratings, needs_service} = request.body;
      await dbFunctions.insertBuilding(name, x_coord, y_coord, time_opens, time_closes, num_snack_machines, num_drink_machines, num_ratings, average_ratings, needs_service);
      reply.send({success: true});
    } catch (err) {
      reply.status(500).send({error: "Failed to insert new building object."});
    }
  });
  
  done();
  
};

module.exports = routes;
