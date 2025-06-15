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

  function getFirstMonday(year: number) {
    let diff = 0;
    let firstDay = (new Date(year, 0, 0)).getDay();
    if (firstDay === 1) {
      diff = 0;
    }
    if (firstDay === 6) {
      diff = 2;
    }
    if (firstDay === 0) {
      diff = 1;
    }
    if (firstDay === 2) {
      diff = -1;
    }
    if (firstDay === 4) {
      diff = +4;
    }
    if (firstDay === 5) {
      diff = +3;
    }
    return diff;
  }

  let firstDay = getFirstMonday(year);
  let arr = [];
  let number = 52;
  if (year === 2020) {
    number = 53;
  }
  for (let i = 0; i < number; i++) {
    let d = (i) * 7; // 1st of January + 7 days for each week
    let startDay = getFormattedDate(new Date(year, 0, d + firstDay));
    let endDay = getInvoiceDateOne(new Date(year, 0, d + firstDay + 4));
    arr[i] = {
      // value:'KW:'+ (i+1) + ' | ' +startDay+' - '+ endDay + '  ' + checkIfWeekIsHoliday(new Date(year, 0, d+firstDay),array),
      value: 'KW:' + (i + 1) + ' | ' + startDay + ' - ' + endDay + '  ',
      // startDay: new Date(year, 0, d + 1),
      // endDay: new Date(year, 0, d + 5),
      week: i + 1
    };
  }
  return arr;
}
