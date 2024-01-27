const mongoose = require("mongoose");
const TransactionSchema = mongoose.model('TransactionSchema');

module.exports.getTransactionTenant = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const transactions = await TransactionSchema.find({ 'tenantId': req.tenantId });

    // Sending the result back to the client
    res.json(transactions);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
