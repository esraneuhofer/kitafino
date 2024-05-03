var mongoose = require('mongoose');

const accountCustomerSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  tenantId: {type: String, required: true},
  customerId: {type: String, required: true},
  currentBalance: {type: Number, required: true}
});

var AccountSchema = mongoose.model('AccountSchema', accountCustomerSchema);

module.exports = AccountSchema;
//

