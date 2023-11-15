var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var menu = new Schema({}, {
//   strict: false
// });
var menu = new Schema({
  tenantId: Schema.Types.ObjectId,
  nameMenu:String,
  type:String,
  recipe:[]
});

var Menu = mongoose.model('Menu', menu);

module.exports = Menu;
