function addDayFromDate(date, daysToAdd) {
  ///Adds x-Amount of Days to specific Day
  let d = new Date(date);
  let daysAhead = d.setDate(d.getDate() + daysToAdd);
  return new Date(daysAhead);
}

function getInvoiceDateOne(date) {
  let result = new Date(date);
  let month = result.getMonth()+1;
  let year  = result.getFullYear();
  let num = result.getDate();
  if (month.toString().length == 1) {
    month = "0" + month;
  }
  let sliced =  ('0' + num).slice(-2);
  return (sliced + '.' +month  + '.' + year);
}
function getTimeToDisplay() {
  let getFormattedDate = getInvoiceDateOne;
  let date = getFormattedDate(new Date);
  let hours = new Date().getHours();
  let minutes = new Date().getMinutes();
  let seconds = new Date().getSeconds();
  if (hours.toString().length == 1) {
    hours = "0" + hours;
  }
  if (minutes.toString().length == 1) {
    minutes = "0" + minutes;
  }
  if (seconds.toString().length == 1) {
    seconds = "0" + seconds;
  }
  let formatted = (date + ' '+hours + ':'+minutes + ':'+seconds+ ' Uhr');
  return formatted
}
module.exports = {
  addDayFromDate,
  getInvoiceDateOne,
  getTimeToDisplay
};
