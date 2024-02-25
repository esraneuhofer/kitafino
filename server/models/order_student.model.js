var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var orderStudent = new Schema({
  tenantId:Schema.Types.ObjectId,
  customerId:Schema.Types.ObjectId,
  userId:Schema.Types.ObjectId,
  kw:{type:Number,required:'{PATH} is required!'},
  year:{type:Number,required:'{PATH} is required!'},
  order:{},
  // price:{type:Number,required:'{PATH} is required!'},
  studentId:Schema.Types.ObjectId,
  dateOrder:String,
  dateOrderPlaced:String,
  postInfo :[
    {
      postId:Schema.Types.ObjectId,
      postDate:String
    }
  ],
  orderId:Schema.Types.ObjectId,
});

orderStudent.pre('save', async function (next) {
  try {
    this.dateOrderPlaced = new Date();
    next();
  } catch (error) {
    next(error);
  }
});
// Creating a unique compound index
orderStudent.index({ studentId: 1, dateOrder: 1 }, { unique: true });


var OrderStudent = mongoose.model('OrderStudent', orderStudent);

module.exports = OrderStudent;

