const routes = (fastify, options, done) => {
    const dbFunctions = require("./database.js");
    
    //route to fetchAllReviews
    fastify.get("/review", async (request, reply) => {
      try{
        const reviews = await dbFunctions.fetchAllReviews();
        reply.send(reviews);
      }
      catch (err) {
        reply.status(500).send({error: "Failed to fetch all reviews"});
      }
    });
    
    fastify.post("/review", async (request, reply) => {
      const {comment, building_id, product_rating} = request.body;
      try {
        await dbFunctions.insertReview(comment, building_id, product_rating);
        reply.send({success: true});
      }
      catch (err) {
        reply.status(500).send({error: "Failed to insert new review object."});
      }
    })
    
    done();
  };
  
  module.exports = routes;