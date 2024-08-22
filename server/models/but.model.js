var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var butmodel = new Schema({
  studentId: {type: Schema.Types.ObjectId, required: true},
  tenantId: {type: Schema.Types.ObjectId, required: true},
  userId: {type: Schema.Types.ObjectId, required: true},
  bildungTeilhabeLog:[{butFrom:String, butTo:String, butAmount:Number}],
});


var ButSchema = mongoose.model('ButSchema', butmodel);

module.exports = ButSchema;

