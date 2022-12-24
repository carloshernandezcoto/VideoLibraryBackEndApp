const validateObjectId = require("../middleware/validateObjectId");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Genre, validate } = require("../models/genre");
const express = require("express");
const router = express.Router();
//router.use(express.json());

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    //throw new Error("Could not get the genres.");
    const genres = await Genre.find().sort("name");
    res.send(genres);
  })
);

router.get(
  "/:id",
  validateObjectId,
  asyncMiddleware(async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send("Genre not found.");
    res.send(genre);
  })
);

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = new Genre({ name: req.body.name });
    //genre = await genre.save();//No need, Mongoose generates the id before saving the object to MongoDB
    await genre.save();
    res.send(genre);
  })
);

router.put(
  "/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    if (!genre) return res.status(404).send("Genre not found.");

    res.send(genre);
  })
);

router.delete(
  "/:id",
  [auth, admin],
  asyncMiddleware(async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if (!genre) return res.status(404).send("Genre not found.");
    res.send(genre);
  })
);

module.exports = router;
