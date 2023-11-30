var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var chargeAccountSchema = new Schema({
  tenantId: Schema.Types.ObjectId,
});

var ChargeAccountSchema = mongoose.model('ChargeAccountSchema', chargeAccountSchema);

module.exports = ChargeAccountSchema;
