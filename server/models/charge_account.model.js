var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the schema based on the interface
var chargeAccountSchema = new Schema({
  approved: { type: Boolean, required: true },
  amount: { type: Number, required: true },
  dateApproved:Date,
  date: { type: Date, required: true },
  iban: String,
  // reference: String,
  typeCharge: { type: String,  required: true },
  tenantId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  customerId: { type: Schema.Types.ObjectId, required: true },
  transactionId:String
});

chargeAccountSchema.pre('save', function(next) {
  if (this.isNew) {
    const randomPart = Math.floor(10000 + Math.random() * 90000); // 5 random digits
    const userIdString = this.userId.toString();
    const userIdPart = userIdString.slice(-5); // last 5 characters of userId
    this.transactionId = `${userIdPart}${randomPart}`;
  }
  next();
});

// Create the model from the schema
var ChargeAccount = mongoose.model('ChargeAccount', chargeAccountSchema);

module.exports = ChargeAccount;
