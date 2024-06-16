
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
  let daysCustomer = customer.generalSettings.deadLineDaily;
  console.log('daysCustomer', daysCustomer)
  let today = new Date();

  // Add x days to today
  today.setDate(today.getDate() + daysCustomer);
  // Get the timezone offset in minutes and convert it to hours
  let offset = today.getTimezoneOffset() / 60;

  // Format the date in 'YYYY-MM-DDT00:00:00+HH:00' format
  // Adjust the timezone offset to ensure it always shows as +01:00
  let formattedDate = today.toISOString().split('T')[0] + 'T00:00:00+02:00';

  return formattedDate;
}

function convertToIsoDate(dateString) {
  const date = new Date(dateString);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}
function convertDayToIsoString(day) {
  let date = new Date(day);
  let formattedDate = date.toISOString().split('T')[0] + 'T00:00:00+02:00';
  return formattedDate;
}
// function getDayWeeklyOrder(customer) {
//   let daysCustomer = customer.generalSettings.deadLineDaily;
//   console.log('daysCustomer', daysCustomer)
//   let today = new Date();
//
//   // Add x days to today
//   today.setDate(today.getDate() + daysCustomer);
//   // Get the timezone offset in minutes and convert it to hours
//   let offset = today.getTimezoneOffset() / 60;
//
//   // Format the date in 'YYYY-MM-DDT00:00:00+HH:00' format
//   // Adjust the timezone offset to ensure it always shows as +01:00
//   let formattedDate = today.toISOString().split('T')[0] + 'T00:00:00+02:00';
//
//   return formattedDate;
// }


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
  convertDayToIsoString,
  isVacation,
  convertToIsoDate
}
