const validateObjectId = require("../middleware/validateObjectId");
const asyncMiddleware = require("../middleware/async");
const { Rental, validate } = require("./../models/rental");
const { Movie } = require("./../models/movie");
const auth = require("../middleware/auth");
const { Customer } = require("../models/customer");
const mongoose = require("mongoose");
//const Fawn = require("fawn");
const express = require("express");
const router = express.Router();
// router.use(express.json());

//Fawn.init("mongodb://127.0.0.1:27017/vidly");

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const rentals = await Rental.find().sort("-dateOut");
    res.send(rentals);
  })
);

router.get(
  "/:id",
  validateObjectId,
  asyncMiddleware(async (req, res) => {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).send("Rental not found.");
    res.send(rental);
  })
);

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("Invalid customer.");

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("Invalid movie.");

    if (movie.numberInStock === 0)
      return res.status(400).send("Movie not in stock.");

    const rental = new Rental({
      customer: {
        _id: customer._id,
        name: customer.name,
        isGold: customer.isGold,
        phone: customer.phone,
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate,
      },
    });
    //rental = await rental.save();//No need, Mongoose generates the id before saving the object to MongoDB
    await rental.save();
    movie.numberInStock--;
    await movie.save();
    res.send(rental);
    //Fawn doesn't seem to work with newer versions of MongoDB/Mongoose...
    //   try {
    //     new Fawn.Task()
    //       .save("rentals", rental)
    //       .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
    //       .run();
    //   } catch (ex) {
    //     res.status(500).send("Server error.");
    //   }
  })
);

module.exports = router;
