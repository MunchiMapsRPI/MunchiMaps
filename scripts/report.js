const dbFunctions = require("./database.js");

const routes = (fastify, options, done) => {

  //route for inserting a report object
  fastify.post("/report", async (request, reply) => {
    try {
      const {building_id, title, description} = request.body;
      await dbFunctions.addReport(building_id, title, description);
      reply.send({success: true});
    } catch (err) {
      reply.status(500).send({error: "Failed to insert new report object."});
    }
  });

  done();
};

module.exports = routes;

