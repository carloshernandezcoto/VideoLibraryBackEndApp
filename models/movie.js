const mongoose = require("mongoose");
const Joi = require("joi");
const { genreSchema } = require("./genre");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 255,
  },
  genre: { type: genreSchema, required: true },
  numberInStock: { type: Number, required: true, min: 0, max: 255 },
  dailyRentalRate: { type: Number, required: true, min: 0, max: 255 },
  liked: { type: Boolean, default: false },
});

const Movie = mongoose.model("Movie", movieSchema);

function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(255).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required(),
  });
  return schema.validate({
    title: movie.title,
    genreId: movie.genreId,
    numberInStock: movie.numberInStock,
    dailyRentalRate: movie.dailyRentalRate,
  });
}

module.exports.Movie = Movie;
module.exports.validate = validateMovie;
