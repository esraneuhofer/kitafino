var mongoose = require('mongoose');

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
const ordersAccountSchema = new mongoose.Schema({
  studentId: {type: String, required: true},
  orderId: {type: String, required: true},
  date: {type: Date, required: true},
  priceAllOrdersDate: {type: Number, required: true},
  allOrdersDate: [allOrdersDateSchema]

  // type: { type: String, enum: ['order', 'cancellation'], required: true }
});


// Method to calculate total price
ordersAccountSchema.methods.calculateTotalPrice = function () {
  this.priceAllOrdersDate = this.allOrdersDate.reduce((total, item) => {
    return total + item.priceTotal;
  }, 0);
};

var OrdersAccountSchema = mongoose.model('OrdersAccountSchema', ordersAccountSchema);

module.exports = OrdersAccountSchema;
//
