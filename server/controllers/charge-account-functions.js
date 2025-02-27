const {getEmailChargeAccount} = require("./email-charge-account");
const {getEmailWithdrawAccount} = require("./email-withdraw-account");

function getMailOptions (chargeAccount,tenantAccount) {
  let bcc = 'monitoring@cateringexpert.de'
  if(chargeAccount.typeCharge !== 'charge') {
    bcc = 'auszahlung@cateringexpert.de'
  }
  return {
    from: '"Cateringexpert" <noreply@cateringexpert.de>',
    replyTo: 'noreply@cateringexpert.de', // This should be dynamically set based on the tenant's email
    bcc:bcc,
    to: tenantAccount.email, // This should be dynamically set based on the tenant's email
    subject: 'Kontoaktivität',
    html: getEmailTextCharge(chargeAccount.amount, chargeAccount.typeCharge,tenantAccount)
  };
}
function getAmountAddRemove(type, amount) {
  return type === 'charge' ? amount : -amount;
}
function getEmailTextCharge(amount, type, tenant) {
  if(type === 'charge') {
    return getEmailChargeAccount(amount, tenant.username);
    // return `Ihrem Konto wurden ${amount}€ gutgeschrieben. Ihr aktueller Kontostand beträgt ${currentBalance}€.`
  }
  return getEmailWithdrawAccount(amount,tenant);
  // return `Ihrem Konto wurden ${amount}€ abgebucht. Ihr aktueller Kontostand beträgt ${currentBalance}€.`
}
module.exports = {getMailOptions, getAmountAddRemove};
