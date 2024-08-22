var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const accountCustomerSchema = new mongoose.Schema({
  userId:{ type: Schema.Types.ObjectId, required: true },
  tenantId:{ type: Schema.Types.ObjectId, required: true },
  customerId:{ type: Schema.Types.ObjectId, required: true },
  currentBalance: Number
});

var AccountSchema = mongoose.model('AccountSchema', accountCustomerSchema);

module.exports = AccountSchema;
//

