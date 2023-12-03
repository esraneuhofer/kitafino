var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const transactionSchema = new mongoose.Schema({
  transactionId: {type: String, required: true},
  date: {type: Date, required: true},
  amount: {type: Number, required: true},
  type: {type: String, enum: ['deposit', 'withdrawal'], required: true}
});

const allOrdersDateSchema = new mongoose.Schema({
  order: [{
    amount: Number,
    priceMenu: Number,
    nameOrder: String,
    idType: String,
  }],
    date: {type: Date, required: true},
  priceTotal: Number,
    type: String

})

const ordersSingleSchema = new mongoose.Schema({
  studentId: {type: String, required: true},
  orderId: {type: String, required: true},
  date: {type: Date, required: true},
  priceAllOrdersDate: {type: Number, required: true},
  allOrdersDate: [allOrdersDateSchema]

  // type: { type: String, enum: ['order', 'cancellation'], required: true }
});

// Method to calculate total price
ordersSingleSchema.methods.calculateTotalPrice = function () {
  this.priceAllOrdersDate = this.allOrdersDate.reduce((total, item) => {
    return total + item.priceTotal;
  }, 0);
};

const accountCustomerSchema = new mongoose.Schema({
  tenantId: {type: String, required: true},
  userId: {type: String, required: true},
  customerId: {type: String, required: true},
  transactions: [transactionSchema],
  orders: [ordersSingleSchema],
  currentBalance: {type: Number, required: true}
});

var AccountSchema = mongoose.model('AccountSchema', accountCustomerSchema);

module.exports = AccountSchema;
//

