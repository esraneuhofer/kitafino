var mongoose = require('mongoose');

const helpSchema = new mongoose.Schema({
 lang: { type: String, required: true },
  routeName: { type: String, required: true },
  base64: { type: String, required: true },
  nameFile: { type: String, required: true },
});

var HelpSchema = mongoose.model('HelpSchema', helpSchema);

module.exports = HelpSchema;
//

