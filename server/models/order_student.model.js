var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var orderStudent = new Schema({
  tenantId:Schema.Types.ObjectId,
  customerId:Schema.Types.ObjectId,
  kw:{type:Number,required:'{PATH} is required!'},
  year:{type:Number,required:'{PATH} is required!'},
  order:{type:Array,required:'{PATH} is required!'},
  studentId:Schema.Types.ObjectId,
  extraOrder:Array,
  postInfo :[
    {
      postId:Schema.Types.ObjectId,
      postDate:String
    }
  ]
});

var OrderStudent = mongoose.model('OrderStudent', orderStudent);

module.exports = OrderStudent;

