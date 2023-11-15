var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var weekplan = new Schema({
  customerId:Schema.Types.ObjectId,
  tenantId:Schema.Types.ObjectId,
  week:Number,
  year:Number,
  name:String,
  weekplan:[],
  allowOneMenuEachDay:[Boolean]

});


var Weekplan = mongoose.model('Weekplan', weekplan);

module.exports = Weekplan;

