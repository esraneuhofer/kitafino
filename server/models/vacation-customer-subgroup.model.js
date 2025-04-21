var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var vacationCustomerSubgroup = new Schema({
  customerId:Schema.Types.ObjectId,
  tenantId:Schema.Types.ObjectId,
  subgroupId:String,
  vacation:
    {
      vacationStart:Date,
      vacationEnd:Date
    }

}, { timestamps: true });  // This adds createdAt and updatedAt fields automatically


var VacationCustomerSubgroup = mongoose.model('VacationCustomerSubgroup', vacationCustomerSubgroup);

module.exports = VacationCustomerSubgroup;

