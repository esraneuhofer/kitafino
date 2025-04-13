var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var withdrawRequest = new Schema({
  tenantId: Schema.Types.ObjectId,
  userId: Schema.Types.ObjectId,
  customerId: Schema.Types.ObjectId,
  amount: Number,
  isPayed: {type:Boolean, default: false},
  iban: String,
  nameAccountHolder: String,
  reference: String,
  withdrawProcessed: {type: Boolean, default: false},
  withdrawProcessedCustomer: {type: Boolean, default: false},
  typeWithdrawal: {
    type: String,
    enum: ['auszahlung', 'nicht_zugeordnet', 'betrag_zu_hoch'],
    default: 'auszahlung'
  }
}, { timestamps: true }); // Hier wird die Option aktiviert


var WithdrawRequest = mongoose.model('WithdrawRequest', withdrawRequest);

module.exports = WithdrawRequest;
