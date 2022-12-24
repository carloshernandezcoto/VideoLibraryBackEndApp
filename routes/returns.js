const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const { Rental } = require("./../models/rental");
const { Movie } = require("./../models/movie");
const express = require("express");
const Joi = require("joi");
const router = express.Router();

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validateReturn(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const rental = await Rental.findOne({
      "customer._id": req.body.customerId,
      "movie._id": req.body.movieId,
    });

    if (!rental)
      return res
        .status(404)
        .send("No rental found for the provided customerId/movieId");
    if (rental.dateReturned)
      return res.status(400).send("Rental already processed");

    rental.returnMovie();
    await rental.save();

    await Movie.updateOne(
      { _id: rental.movie._id },
      { $inc: { numberInStock: 1 } }
    );

    return res.status(200).send(rental);
  })
);

function validateReturn(req) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });
  return schema.validate({ customerId: req.customerId, movieId: req.movieId });
}

module.exports = router;
