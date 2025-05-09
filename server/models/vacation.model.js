var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var vacation = new Schema({
  customerId: Schema.Types.ObjectId,
  tenantId:Schema.Types.ObjectId,
  subgroupId: {type:String, default:'all'},
  vacation: {
    vacationStart: Date,
    vacationEnd: Date
  }
}, { timestamps: true });  // This adds createdAt and updatedAt fields automatically

var Vacation = mongoose.model('Vacation', vacation);

module.exports = Vacation;