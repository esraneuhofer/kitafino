function makePassword() {
  var text = "";
  var possible = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
function getEmailResetPassword(emailUser) {
  let password = makePassword()
  return {
    from: '"Cateringexpert" <noreply@cateringexpert.de>', // sender address
    to: emailUser, // list of receivers
    bcc: "noreply@cateringexpert.de",
    subject: 'Passwort zurücksetzten', // Subject line
    html:``
  }
}

module.exports = {
  getEmailResetPassword
}
