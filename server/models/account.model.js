var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['deposit', 'withdrawal'], required: true }
});

const ordersSingleSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  orderId: { type: String, required: true },
  date: { type: Date, required: true },
  order:[{nameOrder:String,idType:String,priceMenu:Number,amount:Number}],
  priceTotal: { type: Number, required: true },
  type: { type: String, enum: ['order', 'cancellation'], required: true }
});

const accountCustomerSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  userId: { type: String, required: true },
  customerId: { type: String, required: true },
  transactions: [transactionSchema],
  orders: [ordersSingleSchema],
  currentBalance: { type: Number, required: true }
});

var AccountSchema = mongoose.model('AccountSchema', accountCustomerSchema);

module.exports = AccountSchema;
//

