const { handleGlobalErrors } = require("./startup/logger");
const Joi = require("joi");
const cors = require("cors");
const express = require("express");
const app = express();
const config = require("config");

handleGlobalErrors();
app.use(
  cors({
    origin: "https://video-rental-frontend-app.herokuapp.com/movies/",
    credentials: true,
  })
);
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/validation");
require("./startup/validation")();
// require("./startup/db")("mongodb://127.0.0.1:27017/vidly");
require("./startup/db")(config.get("db"));
require("./startup/prod")(app);

const port = process.env.PORT || 3900;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

module.exports = server;
