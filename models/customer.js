const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = new mongoose.Schema({
  isGold: { type: Boolean, default: false },
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  phone: { type: String, required: true, minlength: 3, maxlength: 50 },
});

const Customer = mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    isGold: Joi.boolean(),
    phone: Joi.string().min(3).max(50).required(),
  });
  return schema.validate({
    name: customer.name,
    phone: customer.phone,
    isGold: customer.isGold,
  });
}

module.exports.Customer = Customer;
module.exports.validate = validateCustomer;
