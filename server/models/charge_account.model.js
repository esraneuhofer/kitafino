var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the schema based on the interface
var chargeAccountSchema = new Schema({
  approved: { type: Boolean, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  accountHolder: { type: String, required: true },
  iban: { type: String, required: true },
  reference: String,
  typeCharge: { type: String,  required: true },
  tenantId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  customerId: { type: Schema.Types.ObjectId, required: true },
});

// Create the model from the schema
var ChargeAccount = mongoose.model('ChargeAccount', chargeAccountSchema);

module.exports = ChargeAccount;
