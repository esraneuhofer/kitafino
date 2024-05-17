require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const Schooluser = mongoose.model('Schooluser');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const bcrypt = require('bcryptjs');
const {getEmailResetPassword} = require('./email-reset-password')
const {getHtmlRegistrationEmail} = require('./email-registration');

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
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session };

  try {
    const emailRegistration = req.body.email.toLowerCase();

    // Check for project existence and email uniqueness similar to previous examples

    // Create new user
    let user = new Schooluser({
      email: emailRegistration,
      username: emailRegistration,
      project_id: project._id,
      // Additional properties...
    });

    // Generate password and hash
    user.passwordO = makePassword();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.passwordO, salt);
    user.password = hash;
    user.saltSecret = salt;

    // Save user
    await user.save(opts);

    // Prepare email options
    let emailContent = getHtmlRegistrationEmail(user.email, user.passwordO);
    let mailOptions = {
      from: `${project.companyName} <noreply@cateringexpert.de>`,
      bcc: project.emailRegistration || '',
      to: emailRegistration,
      subject: 'Accountinformationen✔',
      html: emailContent
    };

    // Send the email
    const emailResult = await sendRegistrationEmail(mailOptions);
    if (!emailResult.success) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({ message: emailResult.message, isError: true });
    }

    // Commit transaction if everything is successful
    await session.commitTransaction();
    session.endSession();
    res.status(201).send({ message: 'Ihr Account wurde erfolgreich angelegt und eine Bestätigung wurde versendet.', isError: false });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    res.status(500).send({ message: 'Ein Fehler ist aufgetreten bei der Registrierung.', isError: true });
  }
};

const sendRegistrationEmail = async (emailOptions) => {
  try {
    await sgMail.send(emailOptions);
    return { success: true, message: 'Verifizierungsmail erfolgreich gesendet.' };
  } catch (err) {
    console.error(err);
    if (err.code === 550) { // Hinweis: SendGrid-Fehlercodes überprüfen
      return { success: false, message: 'Die angegebene E-Mail-Adresse ist ungültig. Bitte geben Sie eine gültige E-Mail-Adresse an.' };
    } else {
      return { success: false, message: 'Beim Senden der E-Mail ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' };
    }
  }
}


require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
const Schooluser = require('./models/Schooluser'); // Passen Sie den Pfad zu Ihrem Modell an
const { makePassword, getEmailResetPassword } = require('./utils'); // Passen Sie den Pfad zu Ihren Util-Funktionen an

// Setzen Sie hier Ihren SendGrid API-Schlüssel
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.resetPassword = async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = makePassword();
    const mailOptions = getEmailResetPassword(username, password);

    // Generieren eines Salzes und Hashen des Passworts
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Aktualisieren des Benutzers in der Datenbank
    const updatedUser = await Schooluser.findOneAndUpdate(
      { username: username },
      {
        $set: {
          saltSecret: salt,
          password: hash
        }
      },
      { new: true }
    );

    // Überprüfen, ob der Benutzername gefunden und aktualisiert wurde
    if (!updatedUser) {
      return res.status(404).send({ message: `Benutzername ${username} wurde nicht gefunden.`, error: true });
    }

    // Senden der Zurücksetz-E-Mail
    await sgMail.send(mailOptions);
    res.status(200).send({ message: `Passwort wurde zurückgesetzt. Eine E-Mail mit Ihrem neuen Passwort wurde an ${username} versendet.`, error: false });
  } catch (err) {
    console.error(err); // Es ist gut, den Fehler für das Debuggen zu protokollieren.
    res.status(500).send({ message: 'Es gab ein Fehler beim Zurücksetzen des Passworts.', error: true });
  }
}




