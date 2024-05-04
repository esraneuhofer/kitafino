var mongoose = require('mongoose');

const allOrdersDateSchema = new mongoose.Schema({
  order: [{
    amount: Number,
    priceMenu: Number,
    nameOrder: String,
    idType: String,
  }],
  dateTimeOrder: {type: Date, required: true},
  priceTotal: Number,
  type: String

})
const ordersAccountSchema = new mongoose.Schema({
  studentId: {type: String, required: true},
  tenantId: {type: String, required: true},
  userId: {type: String, required: true},
  customerId: {type: String, required: true},
  orderId: {type: String, required: true},
  dateOrderMenu: {type: Date, required: true},
  year: {type: Number, required: true},
  priceAllOrdersDate: {type: Number, required: true},
  allOrdersDate: [allOrdersDateSchema]

  // type: { type: String, enum: ['order', 'cancellation'], required: true }
});

// Unique index for studentId, userId, and dateOrderMenu
ordersAccountSchema.index({ studentId: 1, userId: 1, dateOrderMenu: 1 }, { unique: true });

// Method to calculate total price
ordersAccountSchema.methods.calculateTotalPrice = function () {
  this.priceAllOrdersDate = this.allOrdersDate.reduce((total, item) => {
    return total + item.priceTotal;
  }, 0);
};

var OrdersAccountSchema = mongoose.model('OrdersAccountSchema', ordersAccountSchema);

module.exports = OrdersAccountSchema;
//
