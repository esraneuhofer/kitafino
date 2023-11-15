var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var articleEdited = new Schema({}, {
  strict: false
});

var ArticleEdited = mongoose.model('ArticleEdited', articleEdited);

module.exports = ArticleEdited;
