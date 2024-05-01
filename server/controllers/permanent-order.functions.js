function studentHasNotPlacedOrderYet(permanentOrderStudent, orderStudents) {
  for (let eachOrderStudent of orderStudents) {
    if (permanentOrderStudent.studentId === eachOrderStudent.studentId) {
      return false;
    }
  }
  return true;
}

function getStundetById(studentId, studentsCustomer) {
  for (let eachStudent of studentsCustomer) {
    if (eachStudent._id.toString() === studentId.toString()) {
      return eachStudent;
    }
  }
  return null;
}

function getDayDeadlineOrder(customer) {
  let daysCustomer = customer.order.deadLineDaily.day;
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
module.exports = {
  studentHasNotPlacedOrderYet,
  getStundetById,
  getDayDeadlineOrder
}
