var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var message = new Schema({
  customerId: Schema.Types.ObjectId,
  createdAt: {type: Date, default: Date.now},
  message: String,
  messageSeen: [String],
  sentBy: String,
  validTill: Date,
  messageId: String,
});

var MessageSchema = mongoose.model('MessageSchema', message);

module.exports = MessageSchema;
