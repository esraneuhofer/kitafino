import {EmailOrderInterface} from "./email-order.function";
import {getTimeToDisplay} from "../../functions/date.functions";

export function getEmailBodyCancel (objectData: EmailOrderInterface): any {
  let titleOrder = 'Vielen Dank für Ihre Bestellung';
  let typeOrder = 'Bestellung'
  const orderTime = getTimeToDisplay();
  let arrayEmail = [objectData.settings.orderSettings.confirmationEmail];
  if(objectData.sendCopyEmail){
    arrayEmail.push(objectData.tenantStudent.email)
  }
  // const emailBody = getEmailBodyHtmlCancel(objectData);
}

