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

function extractTime(time){

  // Split the time string into hours and minutes
  const [hours, minutes] = time.split(':').map(Number);

  // Return hours and minutes as an object
  return {
    hours: hours,
    minutes: minutes
  };
}

function isValidTimeFormat(time) {
  // Regular expression to match the format HH:MM
  const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  // Test the time string against the regular expression
  return timeFormatRegex.test(time);
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

  if (!isValidTimeFormat(datetimeString)) {
    throw new Error('Ungültiges Datumsformat. Bitte verwenden Sie "HH:MM".');
  }

  const hours = extractTime(datetimeString).hours; // Lokale Stunden
  const minutes = extractTime(datetimeString).minutes;

  // Cron-Format-String konstruieren, der jeden Tag zur angegebenen Uhrzeit ausgeführt wird
  const schedule = `${minutes} ${hours} * * *`;

  return schedule;
}
function generateWeeklyCronSchedule(datetimeString, dayOfWeek) {
  // Datum und Uhrzeit validieren und parsen
  const date = new Date(datetimeString);

  if (!isValidTimeFormat(datetimeString)) {
    throw new Error('Ungültiges Datumsformat. Bitte verwenden Sie "HH:MM".');
  }

  if (dayOfWeek < 1 || dayOfWeek > 7) {
    throw new Error('Ungültiger Tag der Woche. Bitte verwenden Sie einen Wert zwischen 1 (Montag) und 7 (Sonntag).');
  }

  const hours = extractTime(datetimeString).hours; // Lokale Stunden
  const minutes = extractTime(datetimeString).minutes;

  // Mapping von 1-7 (Montag-Sonntag) auf 0-6 (Sonntag-Samstag) für Cron
  const cronDayOfWeek = (dayOfWeek % 7).toString();

  // Cron-Format-String konstruieren, der zur angegebenen Uhrzeit am angegebenen Wochentag ausgeführt wird
  const schedule = `${minutes} ${hours} * * ${cronDayOfWeek}`;
  console.log('Cron schedule:', schedule);
  return schedule;
}

module.exports = {
  getWeekNumber,
  generateDailyCronSchedule,
  generateWeeklyCronSchedule,
  getDeadline};
