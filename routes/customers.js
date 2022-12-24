const validateObjectId = require("../middleware/validateObjectId");
const asyncMiddleware = require("../middleware/async");
const auth = require("../middleware/auth");
const { Customer, validate } = require("./../models/customer");
const express = require("express");
const router = express.Router();
//router.use(express.json());

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const customers = await Customer.find().sort("name");
    res.send(customers);
  })
);

router.get(
  "/:id",
  validateObjectId,
  asyncMiddleware(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send("Customer not found.");
    res.send(customer);
  })
);

router.post(
  "/",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = new Customer({
      name: req.body.name,
      isGold: req.body.isGold,
      phone: req.body.phone,
    });
    //customer = await customer.save();//No need, Mongoose generates the id before saving the object to MongoDB
    await customer.save();
    res.send(customer);
  })
);

router.put(
  "/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, isGold: req.body.isGold, phone: req.body.phone },
      { new: true }
    );
    if (!customer) return res.status(404).send("Customer not found.");

    res.send(customer);
  })
);

router.delete(
  "/:id",
  auth,
  asyncMiddleware(async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) return res.status(404).send("Customer not found.");
    res.send(customer);
  })
);

module.exports = router;
