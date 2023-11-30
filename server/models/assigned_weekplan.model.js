var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var assignedWeekplanSchema = new Schema({
  customerId:Schema.Types.ObjectId,
  tenantId:Schema.Types.ObjectId,
  week:Number,
  year:Number,
  name:String,
  groupsWeekplan:[String],
  weekplanId:String,
  weekplanGroupId: String,
  weekplanGroupAllowed: []
});


var AssignedWeekplanSchema = mongoose.model('AssignedWeekplanSchema', assignedWeekplanSchema);

module.exports = AssignedWeekplanSchema;

