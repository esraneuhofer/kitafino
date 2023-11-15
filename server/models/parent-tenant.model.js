var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var tenantpartent = new Schema({
  tenantId:Schema.Types.ObjectId,
  customerId:Schema.Types.ObjectId,
  schoolId:Schema.Types.ObjectId,
  userId:Schema.Types.ObjectId,
  firstName:String,
  lastName:String,
  email:String,
  phone:String,
  address:String,
  city:String,
  zip:String,
});

var Tenantpartent = mongoose.model('Tenantpartent', tenantpartent);

module.exports = Tenantpartent;

