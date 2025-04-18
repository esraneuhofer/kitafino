var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var permanentOrderStudent = new Schema({
  tenantId:Schema.Types.ObjectId,
  customerId:Schema.Types.ObjectId,
  userId:Schema.Types.ObjectId,
  daysOrder:[{
    selected:Boolean,
    menuId:String,
    typeSpecial:String,
  }],
  studentId:Schema.Types.ObjectId,
  isActive:{
    type:Boolean,
    default:true
  },
});


// Creating a unique compound index
permanentOrderStudent.index({ studentId: 1 }, { unique: true });


var PermanentOrderStudent = mongoose.model('PermanentOrderStudent', permanentOrderStudent);

module.exports = PermanentOrderStudent;

