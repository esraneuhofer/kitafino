var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var feedback = new Schema({
  customerId: {type: Schema.Types.ObjectId, required: true},
  tenantId: {type: Schema.Types.ObjectId, required: true},
  userId: {type: Schema.Types.ObjectId, required: true},
  message: String,
  createdAt: {type: Date, default: Date.now},
});


var FeedbackSchema = mongoose.model('FeedbackSchema', feedback);

module.exports = FeedbackSchema;

