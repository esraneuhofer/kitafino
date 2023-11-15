var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var articleDeclarations = new Schema({
  tenantId: Schema.Types.ObjectId,
  articleDeclarations: [{
    name_allergene: String,
    name_allergene_long: String,
    short: String,
    allergeneType: String,
    display: Boolean
  }]
});

var ArticleDeclarations = mongoose.model('ArticleDeclarations', articleDeclarations);

module.exports = ArticleDeclarations;
