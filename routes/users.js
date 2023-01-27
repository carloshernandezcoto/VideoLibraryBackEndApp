const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("./../models/user");
const express = require("express");
const router = express.Router();
// router.use(express.json());

// router.get("/", async (req, res) => {
//   const users = await User.find().sort("name");
//   res.send(users);
// });

// router.get("/:id", async (req, res) => {
//   const user = await User.findById(req.params.id);
//   if (!user) return res.status(404).send("User not found.");
//   res.send(user);
// });

router.get(
  "/me",
  auth,
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.send(user);
    next();
  })
);

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered");

    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    //customer = await customer.save();//No need, Mongoose generates the id before saving the object to MongoDB
    await user.save();

    const token = user.generateAuthToken();

    res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send(_.pick(user, ["_id", "name", "email"]));
    //res.send(user);
  })
);

// router.put("/:id", async (req, res) => {
//   const { error } = validate(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   const user = await Customer.findByIdAndUpdate(
//     req.params.id,
//     { name: req.body.name, email: req.body.email, password: req.body.password },
//     { new: true }
//   );
//   if (!user) return res.status(404).send("User not found.");

//   res.send(user);
// });

// router.delete("/:id", async (req, res) => {
//   const user = await User.findByIdAndRemove(req.params.id);
//   if (!user) return res.status(404).send("User not found.");
//   res.send(user);
// });

module.exports = router;
