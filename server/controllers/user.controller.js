const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const School = mongoose.model('SchoolNew');
const Schooluser = mongoose.model('Schooluser');
var nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const {getEmailResetPassword} = require('./email-reset-password')
const {getHtmlRegistrationEmail} = require('./email-registration');
var transporter = nodemailer.createTransport({
  host: 'smtp.1und1.de',
  port: 465,
  secure: true, // secure:true for port 465, secure:false for port 587
  // service: 'Gmail',
  auth: {
    user: 'noreply@cateringexpert.de',
    pass: '5/5e_FBw)JWTXpu!!adsaaa22'
  }
});
function makePassword() {
  var text = "";
  var possible = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

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
    let emailContent = getHtmlRegistrationEmail(req.body.email.toLowerCase(),password)
    try {
      // Other code...

      await user.save();
      let mailOptions = {
        from: `${data.companyName} <noreply@cateringexpert.de>`,
        bcc: data.emailRegistration,
        to: req.body.email,
        subject: 'Accountinformationen✔',
        html:emailContent
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
module.exports.resetPassword = (req, res, next) => {
  let password = makePassword();
  let mailOptions = getEmailResetPassword(req.body.username);
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      Schooluser.findOneAndUpdate({username: req.body.username}, {
        $set: {
          saltSecret: salt,
          password: hash
        }
      }, {new: true}, function (err, username) {
        if (err) return res.send({message: err});
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            return res.send({message: err});
          }
          res.send({message: 'Password wurde zurückgesetzt. Eine Email mit Ihrem neuen Passwort wurde an Sie versendet'});
        });
      });
    });
  });
}


