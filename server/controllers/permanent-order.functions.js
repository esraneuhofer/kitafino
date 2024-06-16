
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

function studentHasNotPlacedOrderYet(permanentOrderStudent, orderStudents) {
  for (let eachOrderStudent of orderStudents) {
    if (permanentOrderStudent.studentId === eachOrderStudent.studentId) {
      return false;
    }
  }
  return true;
}

function getStudentById(studentId, studentsCustomer) {
  for (let eachStudent of studentsCustomer) {
    if (eachStudent._id.toString() === studentId.toString()) {
      return eachStudent;
    }
  }
  return null;
}

function getDayDeadlineOrder(customer) {
  let daysCustomer = customer.generalSettings.deadlineDaily.day;
  let futureDate = dayjs().add(daysCustomer, 'day');

  // In die Zeitzone 'Europe/Berlin' umwandeln und auf den Anfang des Tages setzen
  let berlinDate = futureDate.tz('Europe/Berlin').startOf('day').format();

  console.log("berlinDate", berlinDate); // Formatiertes Datum in der Zeitzone 'Europe/Berlin'
  return berlinDate;
}


function isVacation(inputDate,vacationArray){
  if(!vacationArray)return;
  let dateToCompare = setDateToCompare(inputDate);
  let bool =false;
  for(let i = 0;i<vacationArray.length; i ++){
    let start = setDateToCompare(vacationArray[i].vacation.vacationStart);
    let end =setDateToCompare(vacationArray[i].vacation.vacationEnd);
    if(!vacationArray[i].vacation.vacationEnd){
      if(start === dateToCompare){
        bool = true;
      }
    }else{
      if(setDateToCompare(vacationArray[i].vacation.vacationStart) === setDateToCompare(inputDate)){
        bool = true;
      }
      else{
        if (end >= dateToCompare && start <= dateToCompare) {
          bool = true;
        }
      }
    }
  }
  return bool;
}
function setDateToCompare(input) {
  let newDate = new Date(input);
  newDate.setHours(0, 0, 0, 0);
  let d = newDate.getTime();
  return d;
}
module.exports = {
  studentHasNotPlacedOrderYet,
  getStudentById,
  getDayDeadlineOrder,
  isVacation,
}
