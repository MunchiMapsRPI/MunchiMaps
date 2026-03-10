const dbFunctions = require("./database.js");
const { sanitizeBody } = require("./sanitize.js");

const insertReviewSchema = {
  body: {
    type: 'object',
    required: ['building_id', 'product_rating'],
    properties: {
      comment: { type: 'string', maxLength: 1000 },
      building_id: { type: 'integer', minimum: 1 },
      product_rating: { type: 'integer', minimum: 1, maximum: 5 }
    }
  }
};

const routes = (fastify, options, done) => {
  
  //route to fetchAllReviews
  fastify.get("/review", async (request, reply) => {
    try {
      const reviews = await dbFunctions.fetchAllReviews();
      reply.send(reviews);
    } catch (err) {
      reply.status(500).send({error: "Failed to fetch all reviews"});
    }
  });
  
  fastify.post("/review", { schema: insertReviewSchema }, async (request, reply) => {
    try {
      const body = sanitizeBody(request.body, ["comment"]);
      const {comment, building_id, product_rating} = body;
      
      const building = dbFunctions.fetchSpecificBuildingByKey(building_id);
      if (!building) {
        return reply.status(404).send({error: `Building with id '${building_id}' not found.`});
      }
      
      await dbFunctions.insertReview(comment, building_id, product_rating);
      reply.status(201).send({success: true});
    } catch (err) {
      reply.status(500).send({error: "Failed to insert new review object."});
    }
  });
  
  done();
};

module.exports = routes;