var mongoose = require('mongoose');

var transactionSchema = new mongoose.Schema({
  tenantId: {type: String, required: true},
  userId: {type: String, required: true},
  customerId: {type: String, required: true},
  transactionId: {type: String, required: true},
  date: {type: Date, required: true},
  amount: {type: Number, required: true},
  type: {type: String, enum: ['deposit', 'withdrawal'], required: true}
});

var TransactionSchema = mongoose.model('TransactionSchema', transactionSchema);

module.exports = TransactionSchema;
//
