var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var sessionStripe = new Schema({
  sessionId: {type: String, required: true},
  userId: {type: Schema.Types.ObjectId, required: true},
  username: {type: String, required: true},

});
sessionStripe.index({ sessionId: 1 }, { unique: true });


var SessionStripe = mongoose.model('SessionStripe', sessionStripe);

module.exports = SessionStripe;

