import * as moment from 'moment-timezone';


export interface OrderSettingsDeadLineDailyInterface{
  day: number;
  time: Date;
  timeBeginn:Date;
  dayBeginn:Date;
  maxAmountRemove: number;
  maxAmountAdd: number;
}

export function timeDifference(deadLineDaily:OrderSettingsDeadLineDailyInterface,dateInputCompare:Date):(string | null) {
  let dayOrder = new Date(dateInputCompare);
  const daysSub = addDayFromDate(dayOrder, - deadLineDaily.day)
  const dateObj = moment(deadLineDaily.time).toDate();
  const hours_:any = dateObj.getHours();
  const minutes_:any = dateObj.getMinutes();

  daysSub.setHours(hours_)
  daysSub.setMinutes(minutes_)
  daysSub.setSeconds(0)
  let difference = daysSub.getTime()- new Date().getTime() ;  // to ensure we get a positive difference

  if(difference < 0){
    return null
  }
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  difference %= (1000 * 60 * 60 * 24);  // subtract the days

  const hours = Math.floor(difference / (1000 * 60 * 60));
  difference %= (1000 * 60 * 60);  // subtract the hours

  const minutes = Math.floor(difference / (1000 * 60));
  difference %= (1000 * 60);  // subtract the minutes

  const seconds = Math.floor(difference / 1000);

  return `${days > 0 ? days + ' Tag' + (days === 1 ? '' : 'e') + ', ' : ''}${hours} Stunde${hours === 1 ? '' : 'n'}, ${minutes} Minute${minutes === 1 ? '' : 'n'},  ${seconds} Sekunde${seconds === 1 ? '' : 'n'}`;
}

export function addDayFromDate(date:Date, daysToAdd:number) {
  ///Adds x-Amount of Days to specific Day
  let d = new Date(date);
  let daysAhead = d.setDate(d.getDate() + daysToAdd);
  return new Date(daysAhead);
}
