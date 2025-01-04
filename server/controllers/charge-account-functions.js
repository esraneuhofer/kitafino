const {getEmailChargeAccount} = require("./email-charge-account");
const {getEmailWithdrawAccount} = require("./email-withdraw-account");

function getMailOptions (chargeAccount,tenantAccount) {
  return {
    from: '"Cateringexpert" <noreply@cateringexpert.de>',
    replyTo: 'noreply@cateringexpert.de', // This should be dynamically set based on the tenant's email
    bcc:'eltern_bestellung@cateringexpert.de',
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
