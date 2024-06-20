var mongoose = require('mongoose');

const helpSchema = new mongoose.Schema({
  nameFile: { type: String, required: true },
  lang: { type: String, required: true },
  filename: { type: String, required: true },
  routeName: { type: String, required: true },
  pdfPath: { type: String, required: true }
});

var HelpSchema = mongoose.model('HelpSchema', helpSchema);

module.exports = HelpSchema;
//

