var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var withdrawRequest = new Schema({
  tenantId: Schema.Types.ObjectId,
  userId: Schema.Types.ObjectId,
  customerId: Schema.Types.ObjectId,
  createdAt: Date,
  amount: Number,
  isPayed: Boolean,
});

var WithdrawRequest = mongoose.model('WithdrawRequest', withdrawRequest);

module.exports = WithdrawRequest;
