import { getFormattedDate, getInvoiceDateOne } from "../../../functions/date.functions";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getYearsQuery(): { year: number, index: number }[] {
  let arr = [];
  let year = dayjs.tz(dayjs(), 'Europe/Berlin').year();
  arr.push({ year: year - 1, index: 0 }, { year: year, index: 1 }, { year: year + 1, index: 2 });
  return arr;
}
export function getCalenderQuery(year: number) {
  return [getCalenderQuerySingleYear(year - 1), getCalenderQuerySingleYear(year), getCalenderQuerySingleYear(year + 1)];
}

function getCalenderQuerySingleYear(year: number): { value: string, week: number }[] {
  let arr = [];

  // Verwende dayjs für bessere Datumsberechnung
  const startOfYear = dayjs.tz(`${year}-01-01`, 'Europe/Berlin');
  const firstMonday = startOfYear.startOf('isoWeek');

  // Bestimme Anzahl der Wochen im Jahr (52 oder 53)
  const lastDayOfYear = dayjs.tz(`${year}-12-31`, 'Europe/Berlin');
  const weeksInYear = lastDayOfYear.isoWeek() === 1 ? 52 : lastDayOfYear.isoWeek();

  for (let i = 0; i < weeksInYear; i++) {
    const weekStart = firstMonday.add(i, 'week');
    const weekEnd = weekStart.add(4, 'day'); // Freitag

    // Direkte dayjs Formatierung statt getFormattedDate
    const startDay = weekStart.format('DD.MM');
    const endDay = getInvoiceDateOne(weekEnd.format('YYYY-MM-DD'));

    arr[i] = {
      value: 'KW:' + (i + 1) + ' | ' + startDay + ' - ' + endDay + '  ',
      week: i + 1
    };
  }
  return arr;
}
