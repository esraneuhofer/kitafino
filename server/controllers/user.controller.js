const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const School = mongoose.model('SchoolNew');
const Schooluser = mongoose.model('Schooluser');
var nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

var transporter = nodemailer.createTransport({
  host: 'smtp.1und1.de',
  port: 465,
  secure: true, // secure:true for port 465, secure:false for port 587
  // service: 'Gmail',
  auth: {
    user: 'noreply@cateringexpert.de',
    pass: 'Master@Peterfischer1808!'
  }
});
function makePassword() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
const User = mongoose.model('User');



module.exports.authenticate = (req, res, next) => {
  // call for passport authentication
  passport.authenticate('local', (err, user, info) => {
    // error from passport middleware
    if (err) return res.status(400).json(err);
    // registered user
    else if (user) return res.status(200).json({"token": user.generateJwt()});
    // unknown user or wrong password
    else return res.status(404).json(info);
  })(req, res);
}

module.exports.userProfile = async (req, res, next) => {
  try {
    const user = await Schooluser.findOne({_id: req._id}).exec();

    if (!user) {
      return res.status(404).json({ status: false, message: 'User record not found.' });
    } else {
      return res.status(200).json({ status: true, user: _.pick(user, ['username', 'email']) });
    }
  } catch (err) {
    // Handle errors here, for example:
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports.getUsers = (req, res, next) => {

  User.find(
    (err, user) => {
      if (!user)
        return res.status(404).json({status: false, message: 'User record not found.'});
      else
        return res.status(200).json({status: true, user: _.pick(user, ['fullName', 'email'])});
    }
  );
}
module.exports.register = async (req, res, next) => {
  try {
    const data = await School.findOne({
      projectId: req.body.projectId.toLowerCase()
    });

    if (!data) {
      return res.send({ message: 'Projekt wurde nicht gefunden', buttonType: 'error',isError:true });
    }

    let user = new Schooluser();
    user.email = req.body.email.toLowerCase();
    user.username = req.body.email.toLowerCase();
    user.project_id = data._id;
    user.tenantId = data.tenantId;
    user.customerId =  data.customerId;
    let password = makePassword(); // Ensure you have a makePassword function defined

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user.passwordO = password;
    user.password = hash;
    user.saltSecret = salt;

    try {
      // Other code...

      await user.save();
      let mailOptions = {
        from: `${data.companyName} <noreply@cateringexpert.de>`,
        bcc: data.emailRegistration,
        to: req.body.email,
        subject: 'Accountinformationen✔',
        html:
          '<div style="width: 100vm;height: 100vh;padding:50px 75px 50px 75px; background:#EDEDED">' +
          '<div style="background: white; border:1px solid lightgray; padding:50px"><b>Wilkommen zur Anmeldung bei ' + data.companyName + ' </b><br><br>' +
          '<div style="margin-bottom: 10px">Die Anmeldung finden Sie unter folgenden Adresse: <br><a href="https://schulanmeldung.cateringexpert.de" target="_blank" style="color: blue">https://schulanmeldung.cateringexpert.de</a></div><br>' +
          '<div style="margin-bottom: 10px">Username: <b><u></u>' + req.body.email.toLowerCase() + '</b><br>Passwort: <b><u>' + password + '</u></b></div><br>' +
          '<div style="margin-bottom: 10px">Sollten Sie Probleme oder Fragen haben, kontaktieren Sie uns bitte</div>' +
          '<div><span><b>Grüße</b></span><br><span><b>' + data.companyName + '</b></span><br><br>' +
          '<div><span><u>Datenschutzverordnung - Einwilligung</u></span><br><br>' +
          '<div><span>Mit Erhalt dieser Email stimme ich zu, dass die von mir mitgeteilten, persönlichen Daten zur' +
          ' Erfüllung der Geschäftsabwicklung von der Firma: ' + data.companyName + ' und verarbeitet werden dürfen.' +
          'Die Daten verbleiben ausschließlich bei dem vorher genannten Unternehmen, sowie von diesem beauftragten Auftragsverarbeitern. \n' +
          'Die Einwilligung kann jederzeit telefonisch, schriftlich per Post oder via Mail ' + data.emailCatering + ' widerrufen werden.</span><br><br>' +
          '<div><span><u>Datenschutzinformation</u></span><br><br>' +
          '<div><span>Die Rechtmäßigkeit der Datenverarbeitung beruht auf Ihrer Einwilligung gemäß DSVGO zum Zweck der Kommunikation zu allgemeinen Informationen bzw. Auftragsbearbeitung und Auftragsabwicklung.\n' +
          'Die von Ihnen bekannt gegebenen Daten werden bis auf Widerruf gespeichert.\n</span><br><br>' +
          '</div></div></div>'
      };

      // Sending the email
      let info = await transporter.sendMail(mailOptions);

      res.send({ message: 'Email wurde an Ihre Emailadresse versendet', buttonType: 'success', mailSuccess: info ,isError:false});
    } catch (err) {
      if (err.code == 11000) {
        res.send({ message: 'Emailadresse wird bereits verwendet', buttonType: 'error', mailSuccess: 'No Success',isError:true });
      } else {
        res.send(err);
      }
    }
      // Code to execute after successful save
    } catch (err) {
      // This block will handle any errors from the try block
      if (err.code == 11000) {
        res.status(422).send({ message: 'Emailadresse wird bereits verwendet', buttonType: 'error', mailSuccess: 'No Success',isError:true });
      } else {
        // Log the error and send a generic error response
        console.error(err); // Log the error for debugging
        res.status(500).send({ message: 'Internal Server Error', buttonType: 'error',isError:true});
      }
    }

    // await user.save();


};

// module.exports.register = (req, res, next) => {
//   School.findOne({
//     // project: req.body.project,
//     projectId: req.body.projectId.toLowerCase()}, function (err, data) {
//     if (!data) return res.send({message: 'Projekt wurde nicht gefunden',buttonType:'error'})
//     if (err) {
//       res.send(err);
//     } else {
//       let user = new Schooluser();
//       user.email = req.body.email.toLowerCase();
//       user.username = req.body.email.toLowerCase();
//       user.project_id = data._id;
//       user.tenantId = data.tenantId;
//       let password = makePassword()
//
//       bcrypt.genSalt(10, (err, salt) => {
//         bcrypt.hash(password, salt, (err, hash) => {
//           user.passwordO = password
//           user.password = hash;
//           user.saltSecret = salt;
//           user.save((err, doc) => {
//             if (!err) {
//               let mailOptions = {
//                 // from: req.body.companyName+'<'+a req.body.orderConfirmationEmail +'>', // sender address
//                 from: data.companyName + '<noreply@cateringexpert.de>', // sender address
//                 bcc: data.emailRegistration,
//                 to: req.body.email, // list of receivers
//                 subject: 'Accountinformationen✔', // Subject line
//                 html:
//                   '<div style="width: 100vm;height: 100vh;padding:50px 75px 50px 75px; background:#EDEDED">' +
//                   '<div style="background: white; border:1px solid lightgray; padding:50px"><b>Wilkommen zur Anmeldung bei ' + data.companyName + ' </b><br><br>' +
//                   '<div style="margin-bottom: 10px">Die Anmeldung finden Sie unter folgenden Adresse: <br><a href="https://schulanmeldung.cateringexpert.de" target="_blank" style="color: blue">https://schulanmeldung.cateringexpert.de</a></div><br>' +
//                   '<div style="margin-bottom: 10px">Username: <b><u></u>' + req.body.email.toLowerCase() + '</b><br>Passwort: <b><u>' + password + '</u></b></div><br>' +
//                   '<div style="margin-bottom: 10px">Sollten Sie Probleme oder Fragen haben, kontaktieren Sie uns bitte</div>' +
//                   '<div><span><b>Grüße</b></span><br><span><b>' + data.companyName + '</b></span><br><br>' +
//                   '<div><span><u>Datenschutzverordnung - Einwilligung</u></span><br><br>' +
//                   '<div><span>Mit Erhalt dieser Email stimme ich zu, dass die von mir mitgeteilten, persönlichen Daten zur' +
//                   ' Erfüllung der Geschäftsabwicklung von der Firma: ' + data.companyName + ' und verarbeitet werden dürfen.' +
//                   'Die Daten verbleiben ausschließlich bei dem vorher genannten Unternehmen, sowie von diesem beauftragten Auftragsverarbeitern. \n' +
//                   'Die Einwilligung kann jederzeit telefonisch, schriftlich per Post oder via Mail ' + data.emailCatering + ' widerrufen werden.</span><br><br>' +
//                   '<div><span><u>Datenschutzinformation</u></span><br><br>' +
//                   '<div><span>Die Rechtmäßigkeit der Datenverarbeitung beruht auf Ihrer Einwilligung gemäß DSVGO zum Zweck der Kommunikation zu allgemeinen Informationen bzw. Auftragsbearbeitung und Auftragsabwicklung.\n' +
//                   'Die von Ihnen bekannt gegebenen Daten werden bis auf Widerruf gespeichert.\n</span><br><br>' +
//                   '</div></div></div>'
//               };
//               transporter.sendMail(mailOptions, function (error, info) {
//                 if (error) {
//                   res.send({message:'Email konnte nicht an Ihre Emailadresse versendet werden. Bitte wenden Sie sich an Ihren Caterer',buttonType:'error',mailSuccess: error});
//                 } else {
//                   res.send({message:'Email wurde an IHre Email adresse versendet',buttonType:'success',mailSuccess: info});
//                 }
//               });
//
//             } else {
//               if (err.code == 11000)
//                 res.status(422).send({message: 'Emailadresse wird bereits verwendet',buttonType:'success',mailSuccess: 'No Success'});
//               else
//                 return res.send(err);
//             }
//           });
//
//         });
//       });
//     }
//   });
// }



