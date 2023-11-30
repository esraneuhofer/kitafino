const mongoose = require("mongoose");
const AccountSchema = mongoose.model('AccountSchema');
const ChargeAccountSchema = mongoose.model('ChargeAccountSchema');


module.exports.getAccountTenant = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const account = await AccountSchema.findOne({ 'userId': req._id });

    // Sending the result back to the client
    res.json(account);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getAccountChargesDate = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const account = await ChargeAccountSchema.find({ 'userId': req._id });

    // Sending the result back to the client
    res.json(account);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.chargeAccountTenant = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const accountCharge = await ChargeAccountSchema.findOne({ 'userId': req._id });

    // Sending the result back to the client
    res.json(accountCharge);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
