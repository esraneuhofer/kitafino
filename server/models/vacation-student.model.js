var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var vacationStudent = new Schema({
  customerId:Schema.Types.ObjectId,
  userId:Schema.Types.ObjectId,
  studentId:Schema.Types.ObjectId,
  vacation:
    {
      vacationStart:Date,
      vacationEnd:Date
    }

}, { timestamps: true });  // This adds createdAt and updatedAt fields automatically


var VacationStudent = mongoose.model('VacationStudent', vacationStudent);

module.exports = VacationStudent;

