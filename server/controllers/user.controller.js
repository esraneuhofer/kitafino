require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const Schooluser = mongoose.model('Schooluser');
const SchoolNew = mongoose.model('SchoolNew');
const {convertToSendGridFormat} = require('./sendfrid.controller');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const bcrypt = require('bcryptjs');
const {getEmailResetPassword} = require('./email-reset-password')
const {getHtmlRegistrationEmail} = require('./email-registration');
const {getEmailChangePassword} = require('./get-email-body-change-password');

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
    // const lang = req.cookies.lang || 'de';
    // console.log('lang', lang);

    const emailRegistration = req.body.email.toLowerCase();
    const projectExists  = await SchoolNew.findOne({projectId: req.body.projectId.toLowerCase()}).session(session);
    if(!projectExists){
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ message: "PROJECT_NOT_EXIST", isError: true });
    }
    // Check if email already exists
    const existingUser = await Schooluser.findOne({ email: emailRegistration }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send({ message:'EMAIL_ALREADY_REGISTERED', isError: true });
    }

    // Create new user
    const user = new Schooluser({
      registrationDate: new Date(),
      email: emailRegistration,
      username: emailRegistration,
      project_id: projectExists._id,
      customerId: projectExists.customerId,
      tenantId: projectExists.tenantId,

    });

    // Generate password and hash
    let password = makePassword();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user.password = hash;
    user.saltSecret = salt;

    // Save user
    await user.save(opts);

    // Prepare email options
    const emailContent = getHtmlRegistrationEmail(user.email, password);
    const mailOptions = convertToSendGridFormat({
      from: `Cateringexpert <noreply@cateringexpert.de>`,
      bcc:'monitoring@cateringexpert.de',
      to: emailRegistration,
      subject: 'Accountinformationen✔',
      html: emailContent
    });
    let copy = JSON.parse(JSON.stringify(mailOptions));
    delete copy.html;
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
    res.status(201).send({ message: 'REGISTRATION_SUCCESS', isError: false });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    res.status(500).send({ message:'REGISTRATION_ERROR', isError: true });
  }
};

const sendRegistrationEmail = async (emailOptions) => {
  try {
    await sgMail.send(emailOptions);
    return { success: true, message: 'Verifizierungsmail erfolgreich gesendet.' };
  } catch (err) {
    console.error(err);
    if (err.response) {
      console.error('SendGrid error code:', err.response.statusCode);
      console.error('SendGrid error body:', err.response.body);
    } else {
      console.error('Error sending email:', err);
    }
    if (err.code === 550) { // Hinweis: SendGrid-Fehlercodes überprüfen
      return { success: false, message: 'Die angegebene E-Mail-Adresse ist ungültig. Bitte geben Sie eine gültige E-Mail-Adresse an.' };
    } else {
      return { success: false, message: 'Beim Senden der E-Mail ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' };
    }
  }
}


// Setzen Sie hier Ihren SendGrid API-Schlüssel
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.deactivateAccount = async (req, res, next) => {
  try {
    const password = makePassword();

    // Benutzer aus der Datenbank holen
    const user = await Schooluser.findById(req._id);
    
    if (!user) {
      return res.status(404).send({ message: `Benutzer wurde nicht gefunden.`, error: true });
    }
    
    // Benutzernamen und E-Mail mit "_deactivated" versehen
    const deactivatedUsername = `${user.username}_deactivated`;
    const deactivatedEmail = `${user.email}_deactivated`;

    // Generieren eines Salzes und Hashen des Passworts
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Aktualisieren des Benutzers in der Datenbank
    const updatedUser = await Schooluser.findOneAndUpdate(
      { _id: req._id },
      {
        $set: {
          username: deactivatedUsername,
          email: deactivatedEmail,
          saltSecret: salt,
          password: hash
        }
      },
      { new: true }
    );

    // Überprüfen, ob der Benutzer aktualisiert wurde
    if (!updatedUser) {
      return res.status(500).send({ message: `Fehler beim Deaktivieren des Accounts.`, error: true });
    }

    // Erfolgsmeldung senden
    res.status(200).send({ message: `Account wurde erfolgreich deaktiviert.`, error: false });
  } catch (err) {
    console.error(err); // Es ist gut, den Fehler für das Debuggen zu protokollieren.
    res.status(500).send({ message: 'Es gab einen Fehler beim Deaktivieren des Accounts.', error: true });
  }
}

module.exports.changePassword = async (req, res, next) => {
  try {
    const user = await Schooluser.findOne({ _id: req._id });
    if (!user) {
      return res.status(404).json({ error: true, message: 'User record not found.' });
    }

    req.body.email = user.email;
    req.body.password = req.body.oldPassword;

    passport.authenticate('local', async (err, authenticatedUser, info) => {
      if (err) {
        console.error('Passport error:', err);
        return res.status(500).send({ message: "Ein Fehler ist aufgetreten", error: true });
      }

      if (!authenticatedUser) {
        console.error('Authentication failed:', info);
        return res.status(401).send({ message: "Das alte Passwort ist nicht korrekt", error: true });
      }

      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.newPassword, salt);

        await Schooluser.findOneAndUpdate(
          { _id: req._id },
          {
            $set: {
              saltSecret: salt,
              password: hash
            }
          },
          { new: true }
        );

        const mailOptions = convertToSendGridFormat(getEmailChangePassword(user.email));

        await sgMail.send(mailOptions);
        return res.send({ message: 'Password wurde erfolgreich geändert', error: false });
      } catch (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).send({ message: 'Es ist ein Fehler beim Aktualisieren des Passworts aufgetreten', error: true });
      }
    })(req, res, next);
  } catch (findError) {
    console.error('Internal error:', findError);
    return res.status(500).json({ message: 'Ein interner Fehler ist aufgetreten', error: true });
  }
};


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
          password: hash,
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




