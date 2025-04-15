var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var vacationStudent = new Schema({
  customerId:Schema.Types.ObjectId,
  userId:Schema.Types.ObjectId,
  vacation:
    {
      vacationStart:Date,
      vacationEnd:Date
    }

});


var VacationStudent = mongoose.model('VacationStudent', vacationStudent);

module.exports = VacationStudent;

