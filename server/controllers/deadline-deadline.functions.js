function addDays(daysToAdd) {
  let date = new Date();
  let daysAhead = date.setDate(date.getDate() + daysToAdd);
  return daysAhead;
}

function getDeadline(orderSetting, weekNumber, startWeekNumber, startYear, endYear) {
  if (!weekNumber) {
    return;
  }
  let yearsDiff = endYear - startYear;
  let end = getDeadLineOne(orderSetting.deadlineWeekly, weekNumber, startWeekNumber, yearsDiff, startYear);
  let now = new Date();
  return end - now;
}
function getDeadLineOne(object, weeknumber, startWeek, yearsDiff, startYear) {
  function getSub() {
    let num = 0;
    if (new Date().getDay() === 0) {
      num = -1;
    }
    return num;
  }

  if (yearsDiff !== 0) {
    let sub = getSub();
    let diff = parseFloat(weeknumber) + sub - startWeek - (parseFloat(object.weeks));
    let days = parseInt(object.day) - (new Date()).getDay() + (7 * diff) + (365 * yearsDiff);
    if (startYear === 2020) {
      days += 6;
    }
    let deadLine = new Date(addDays(days));
    let dayDeadLine = deadLine.getDate();
    let yearDeadLine = deadLine.getFullYear();
    let monthDeadLine = deadLine.getMonth();
    let time = new Date(object.time);
    let hours = time.getHours();
    let min = time.getMinutes();
    return new Date(yearDeadLine, monthDeadLine, dayDeadLine, hours, min, 0, 0);
  } else {
    let sub = getSub();
    let diff = parseFloat(weeknumber) + sub - startWeek - (parseFloat(object.weeks));
    let days = parseInt(object.day) - (new Date()).getDay() + (7 * diff);
    let deadLine = new Date(addDays(days));
    let dayDeadLine = deadLine.getDate();
    let yearDeadLine = deadLine.getFullYear();
    let monthDeadLine = deadLine.getMonth();
    let time = new Date(object.time);
    let hours = time.getHours();
    let min = time.getMinutes();
    return new Date(yearDeadLine, monthDeadLine, dayDeadLine, hours, min, 0, 0);
  }


}

function getWeekNumber(startD) {
  let startDate =  new Date (startD);
  let d = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
  let dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
function generateDailyCronSchedule(datetimeString) {
  // Datum und Uhrzeit validieren und parsen
  const date = new Date(datetimeString);

  if (isNaN(date.getTime())) {
    throw new Error('Ungültiges Datumsformat. Bitte verwenden Sie "YYYY-MM-DD HH:MM:SS".');
  }

  const hours = date.getHours(); // Lokale Stunden
  const minutes = date.getMinutes();

  // Cron-Format-String konstruieren, der jeden Tag zur angegebenen Uhrzeit ausgeführt wird
  const schedule = `${minutes} ${hours} * * *`;

  return schedule;
}
module.exports = {
  getWeekNumber,
  generateDailyCronSchedule,
  getDeadline};
