var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the schema based on the interface
var chargeAccountSchema = new Schema({
  approved: { type: Boolean, required: true },
  dateApproved: Date,
  amount: { type: Number, required: true },
  datePaymentReceived: { type: Date, required: true },
  accountHolder: String,
  iban: String,
  reference: String,
  typeCharge: { type: String, required: true },
  tenantId: { type: Schema.Types.ObjectId, required: true },
  transactionId: {type:String, required: true, unique: true},
  username: String,
  userId: { type: Schema.Types.ObjectId, required: true },
  customerId: { type: Schema.Types.ObjectId, required: true },
});


// Create the model from the schema
var ChargeAccount = mongoose.model('ChargeAccount', chargeAccountSchema);

module.exports = ChargeAccount;
