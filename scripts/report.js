const dbFunctions = require("./database.js");

const insertReportSchema = {
  body: {
    type: 'object',
    required: ['building_id', 'title'],
    properties: {
      building_id: { type: 'integer', minimum: 1 },
      title: { type: 'string', minLength: 1, maxLength: 200 },
      description: { type: 'string', maxLength: 2000 }
    }
  }
};

const routes = (fastify, options, done) => {

  //route for inserting a report object
  fastify.post("/report", { schema: insertReportSchema }, async (request, reply) => {
    try {
      const {building_id, title, description} = request.body;
      
      const building = dbFunctions.fetchSpecificBuildingByKey(building_id);
      if (!building) {
        return reply.status(404).send({error: `Building with id '${building_id}' not found.`});
      }
      
      await dbFunctions.addReport(building_id, title, description);
      reply.status(201).send({success: true});
    } catch (err) {
      reply.status(500).send({error: "Failed to insert new report object."});
    }
  });

  done();
};

module.exports = routes;

