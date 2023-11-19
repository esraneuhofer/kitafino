var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var school = new Schema({
  tenantId:Schema.Types.ObjectId,
  customerId:Schema.Types.ObjectId,
  nameSchool:String,
  contactPerson:String,
  phone: String,
  zipcode:String,
  street:String,
  project:String,
  projectId:String,
  paymentSystem:String,
  nameBank:String,
  ibanSchool:String,
  glaeubiger:String,
  hasGanzTag:Boolean,
  orderType:{
    typeOrder:String,
    description:[{nameDescription:String,price:Number, days:Number}]
  },
  specials:[{idSpecial:String,selected:Boolean}],
  email:String,
  emailCatering:String,
  emailRegistration:String,

  companyName:String,
  ganztagText:{
    textGanztag:String,
    textGanztagTrue:String,
    textGanztagFalse:String,
  }
});

var SchoolNew = mongoose.model('SchoolNew', school);

module.exports = SchoolNew;

