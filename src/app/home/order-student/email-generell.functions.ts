import {EmailOrderInterface} from "./email-order.function";

export function getBodyEmailGenerell(
  objectData:EmailOrderInterface,
  arrayEmail:string[],
  htmlOrder:string):any{
  return {
    from: objectData.settings.tenantSettings.contact.companyName + '<noreply@cateringexpert.de>', // sender address
      replyTo: objectData.settings.orderSettings.confirmationEmail,
    to: arrayEmail, // list of receivers
    subject: 'Bestellbestätigung✔', // Subject line
    html: htmlOrder
  };
}
