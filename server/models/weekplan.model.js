var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var weekplanPdf = new Schema({
  tenantId:Schema.Types.ObjectId,
  calenderWeek:Number,
  year:Number,
  groups:[],
  name:String,
  base64:String

});


var WeekplanPdf = mongoose.model('WeekplanPdf', weekplanPdf);

module.exports = WeekplanPdf;

