var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var order = new Schema({
  tenantId:Schema.Types.ObjectId,
  customerId:Schema.Types.ObjectId,
  userId:Schema.Types.ObjectId,
  // startDay:{type:Date,required:'{PATH} is required!'},
  // endDay:{type:Date,required:'{PATH} is required!'},
  kw:{type:Number,required:'{PATH} is required!'},
  year:{type:Number,required:'{PATH} is required!'},
  order:{type:Array,required:'{PATH} is required!'},
  extraOrder:Array,
  postInfo :[
    {
      postId:Schema.Types.ObjectId,
      postDate:String
    }
  ]
});

var Order = mongoose.model('Order', order);

module.exports = Order;

