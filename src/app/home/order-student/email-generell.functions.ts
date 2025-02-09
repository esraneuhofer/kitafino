import {EmailOrderInterface} from "./email-order.function";

export function getBodyEmailGenerell(
  objectData:EmailOrderInterface,
  arrayEmail:string[],
  htmlOrder:string):any{
  return {
    bcc:'monitoring@cateringexpert.de',
    from: 'Cateringexpert<noreply@cateringexpert.de>', // sender address
      replyTo: objectData.settings.orderSettings.confirmationEmail,
    to: arrayEmail, // list of receivers
    subject: 'Bestellbestätigung✔', // Subject line
    html: htmlOrder
  };
}
