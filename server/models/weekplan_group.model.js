var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var weekplanGroup = new Schema({
  tenantId:Schema.Types.ObjectId,
  nameWeekplanGroup:String,
  groups:Array
});


var WeekplanGroup = mongoose.model('WeekplanGroup', weekplanGroup);

module.exports = WeekplanGroup;

