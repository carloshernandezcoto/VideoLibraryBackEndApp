const validateObjectId = require("../middleware/validateObjectId");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Movie, validate } = require("./../models/movie");
const { Genre } = require("../models/genre");
const express = require("express");
const router = express.Router();
// router.use(express.json());

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const movies = await Movie.find().sort("title");
    res.send(movies);
  })
);

router.get(
  "/:id",
  validateObjectId,
  asyncMiddleware(async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).send("Movie not found.");
    res.send(movie);
  })
);

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send("Invalid genre.");

    const movie = new Movie({
      title: req.body.title,
      genre: { _id: genre._id, name: genre.name },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    });

    //movie = await movie.save(); //No need, Mongoose generates the id before saving the object to MongoDB
    await movie.save();
    res.send(movie);
  })
);

router.put(
  "/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send("Invalid genre.");

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        genre: { _id: genre._id, name: genre.name },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
        liked: req.body.liked ? req.body.liked : false,
      },
      { new: true }
    );
    if (!movie) return res.status(404).send("Movie not found.");

    res.send(movie);
  })
);

router.delete(
  "/:id",
  [auth, admin],
  asyncMiddleware(async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if (!movie) return res.status(404).send("Movie not found.");
    res.send(movie);
  })
);

module.exports = router;
