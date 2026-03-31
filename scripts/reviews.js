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
  
  // Paginated reviews: ?limit=&offset=
  fastify.get("/review", async (request, reply) => {
    try {
      const limit = Math.min(Math.max(parseInt(request.query.limit, 10) || 50, 1), 500);
      const offset = Math.max(parseInt(request.query.offset, 10) || 0, 0);
      const total = dbFunctions.countReviews();
      const items = dbFunctions.fetchReviewsPage(limit, offset);
      reply.send({
        success: true,
        data: { items },
        meta: { total, limit, offset, hasMore: offset + items.length < total },
      });
    } catch (err) {
      reply.status(500).send({ success: false, error: { message: "Failed to fetch reviews" } });
    }
  });
  
  fastify.post("/review", { schema: insertReviewSchema }, async (request, reply) => {
    try {
      const body = sanitizeBody(request.body, ["comment"]);
      const {comment, building_id, product_rating} = body;
      
      const building = dbFunctions.fetchSpecificBuildingByKey(building_id);
      if (!building) {
        return reply.status(404).send({ success: false, error: { message: `Building with id '${building_id}' not found.` } });
      }
      
      await dbFunctions.insertReview(comment, building_id, product_rating);
      reply.status(201).send({ success: true, data: { created: true } });
    } catch (err) {
      reply.status(500).send({ success: false, error: { message: "Failed to insert new review object." } });
    }
  });
  
  done();
};

module.exports = routes;