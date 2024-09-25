

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
// {time:dateString, day:dayOfWeek}
function dateAndDayOfWeekToCron(obj) {

  const date = new Date(addHourToTime(obj.time));

  // Extract date components
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();

  // Ensure dayOfWeek is within 1 to 7 range
  obj.day = Math.max(1, Math.min(7, obj.day));

  return `${minute} ${hour} * * ${obj.day}`;
}

function addHourToTime(dateString) {
  const originalTime = new Date(dateString);
  const addedHour = new Date(originalTime.getTime() + (60 * 60 * 1000)); // Adding an hour (in milliseconds)

  return addedHour;
}

function calculateTargetWeekAndYear(deadlineWeeks) {
  const currentDate = new Date();
  const currentWeek = getWeekNumber(currentDate);
  const currentYear = currentDate.getFullYear();

  const totalWeeksInCurrentYear = getTotalWeeksInYear(currentYear);
  let targetWeek = currentWeek + deadlineWeeks;
  let targetYear = currentYear;

  if (targetWeek > totalWeeksInCurrentYear) {
    targetWeek -= totalWeeksInCurrentYear;
    targetYear += 1;
  }

  // Handle case where targetWeek becomes 0
  if (targetWeek <= 0) {
    targetYear -= 1;
    const totalWeeksInPreviousYear = getTotalWeeksInYear(targetYear);
    targetWeek += totalWeeksInPreviousYear;
  }

  return { targetWeek, targetYear };
}

function getTotalWeeksInYear(year) {
  const lastDayOfYear = new Date(year, 11, 31);
  const weekOfLastDay = getWeekNumber(lastDayOfYear);

  if (weekOfLastDay === 1) {
    // Falls der 31. Dezember in der 1. Woche des nächsten Jahres ist,
    // dann hat das aktuelle Jahr 52 Wochen.
    return 52;
  }

  return weekOfLastDay;
}

function getDateMondayFromCalenderweek(week, year) {
  // Create a date object set to the first day of the given year in UTC
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));

  // Get the day of the week for the first day of the year (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = firstDayOfYear.getUTCDay();

  // Calculate the date of the first Thursday of the year in UTC
  const firstThursday = new Date(Date.UTC(year, 0, 1 + (4 - dayOfWeek + 7) % 7));

  // Calculate the ISO week number for the first Thursday
  const firstMonday = new Date(firstThursday);
  firstMonday.setUTCDate(firstThursday.getUTCDate() - (firstThursday.getUTCDay() + 6) % 7);

  // Calculate the date of the Monday of the given week number in UTC
  const targetMonday = new Date(firstMonday);
  targetMonday.setUTCDate(firstMonday.getUTCDate() + (week - 1) * 7);

  return targetMonday;
}
// function getDateMondayFromCalenderweek(w, y) {
//   let simple = new Date(y, 0, 1 + (w - 1) * 7);
//   let dow = simple.getDay();
//   let ISOweekStart = simple;
//   if (dow <= 4)
//     ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
//   else
//     ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
//   return ISOweekStart;
// }
function getWeekNumber(startD) {
  let startDate =  new Date (startD);
  let d = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
  let dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}




module.exports = {
  addDayFromDate,
  getInvoiceDateOne,
  getTimeToDisplay,
  dateAndDayOfWeekToCron,
  getWeekNumber,
  getDateMondayFromCalenderweek
};
