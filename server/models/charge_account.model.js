var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Define the main schema
var chargeAccountSchema = new Schema({
  approved: { type: Boolean, required: true },
  dateApproved: Date,
  amount: { type: Number, required: true },
  datePaymentReceived: { type: Date, required: true },
  accountHolder: String,
  iban: String,
  reference: String,
  typeCharge: { type: String, required: true },
  typeChargeName: {
    type: String,
    required: true,
    enum: ['but', 'bankeinzahlung_auto', 'bankeinzahlung_manuell', 'auszahlung_but', 'auszahlung_bank', 'stripe_einzahlung', 'sonstige'],
  },
  tenantId: { type: Schema.Types.ObjectId, required: true },
  transactionHash: {type:String},
  apiTransactionId: {type:String},
  username: String,
  userId: { type: Schema.Types.ObjectId, required: true },
  customerId: { type: Schema.Types.ObjectId, required: true },
});



// Create the model from the schema
var ChargeAccount = mongoose.model('ChargeAccount', chargeAccountSchema);

module.exports = ChargeAccount;
