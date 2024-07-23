var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var butdocument = new Schema({
  studentId: {type: Schema.Types.ObjectId, required: true},
  tenantId: {type: Schema.Types.ObjectId, required: true},
  userId: {type: Schema.Types.ObjectId, required: true},
  customerId:  {type: Schema.Types.ObjectId, required: true},
  name: String,
  nameStudent: String,
  username: String,
  base64: String,
  dateUploaded: Date
});


var ButDocumentSchema = mongoose.model('ButDocumentSchema', butdocument);

module.exports = ButDocumentSchema;

