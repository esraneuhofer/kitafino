var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var message = new Schema({
    tenantId: Schema.Types.ObjectId,
    customerId: Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now },
    heading:String,
    customers:[{nameCustomer:String,customerId:String}],
    message:String,
    messageSeen:[String],
    sentBy:String,
  validTill:Date
});

var MessageSchema = mongoose.model('MessageSchema', message);

module.exports = MessageSchema;
