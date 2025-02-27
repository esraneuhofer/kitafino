const mongoose = require("mongoose");
require('dotenv').config();
const sgMail = require('@sendgrid/mail')
const AccountSchema = mongoose.model('AccountSchema');
const ChargeAccount = mongoose.model('ChargeAccount');
const WithdrawModel = mongoose.model('WithdrawRequest');
const {getMailOptions, getAmountAddRemove} = require('../controllers/charge-account-functions');

function setChargeWithdraw(charge,tenant){

  return {
    approved: charge.approved,
    username: charge.username,
    reference: charge.reference,
    dateApproved: new Date(),
    amount: charge.amount,
    datePaymentReceived: new Date(),
    accountHolder: charge.accountHolder,
    iban: charge.iban,
    typeCharge: 'auszahlung',
    tenantId: charge.tenantId,
    userId: charge.userId,
    customerId: charge.customerId,
    transactionHash: 'no_transaction',
    apiTransactionId: 'no_transaction'
  };
}

async function addAccountChargesTenant(req, session) {
  try {
    // 1) Neues Charge-Dokument erstellen
    let newAccountCharge = new ChargeAccount(req.body.accountCharge);
    const accountCharge = await newAccountCharge.save({ session });

    // 2) UserId aus der Body laden
    const userId = req.body.accountCharge.userId;

    // 3) Account und TenantAccount (optional) laden
    const account = await AccountSchema.findOne({ userId }).session(session);

    // 4) Betrag berechnen (positiv/negativ) und Kontostand anpassen
    const amountAddRemove = getAmountAddRemove(
      req.body.accountCharge.typeCharge,
      req.body.accountCharge.amount
    );
    account.currentBalance += amountAddRemove;

    // 5) Negativen Kontostand verhindern
    if (account.currentBalance < 0) {
      // Werfe einen Error – dieser wird in der aufrufenden Funktion
      // per try/catch behandelt und ggf. ein Rollback durchgeführt.
      throw new Error('Operation abgelehnt. Kontostand würde negativ werden.');
    }

    // 6) Account speichern
    await account.save({ session });

    // 7) E-Mail senden
    const mailOptions = getMailOptions(req.body.accountCharge, req.body.tenant);
    await sgMail.send(mailOptions);

    // 8) Erfolgs-Info zurückgeben (aber kein res.json!)
    return {
      success: true,
      message: 'Account erfolgreich geändert.',
      accountCharge,
    };
  } catch (error) {
    // Fehler weiterschmeißen, sodass die aufrufende Funktion
    // ihn abfängt und ggf. einen Rollback durchführt.
    throw error;
  }
}

module.exports.withdrawFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) Validierung
    if (
      !req.body.accountCharge ||
      typeof req.body.accountCharge.amount !== 'number'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Kein gültiger Auszahlungsbetrag übergeben.',
      });
    }

    // 2) Auszahlungsdaten setzen
    const charge = setChargeWithdraw(req.body.accountCharge);
    charge.typeChargeName = 'auszahlung_bank';
    req.body.accountCharge = charge;

    // 3) addAccountChargesTenant ausführen
    const addChargeResult = await addAccountChargesTenant(req, session);
    if (!addChargeResult.success) {
      throw new Error('Fehler bei addAccountChargesTenant');
    }

    // 4) Neues Withdraw-Dokument anlegen
    const requestDesolve = new WithdrawModel({
      amount: req.body.accountCharge.amount,
      tenantId: req.body.accountCharge.tenantId,
      customerId: req.body.accountCharge.customerId,
      userId: req.body.accountCharge.userId,
      createdAt: new Date(),
      isPayed: false,
    });

    // 5) Speichern innerhalb der Session
    await requestDesolve.save({ session });

    const mailOptions = getMailOptions(req.body.accountCharge, req.body.tenant);
    await sgMail.send(mailOptions);

    // 6) Transaktion committen
    await session.commitTransaction();
    session.endSession();

    // Erfolgsantwort
    return res.json({
      success: true,
      message: 'Auszahlungsanforderung erfolgreich erstellt und E-Mail gesendet.',
    });

  } catch (error) {
    // Im Fehlerfall die Transaktion zurückrollen
    await session.abortTransaction();
    session.endSession();

    console.error('Fehler in withdrawFunds:', error);

    // Fehlerantwort
    return res.status(500).json({
      success: false,
      message: 'Fehler bei der Auszahlungsanforderung.',
      error: error.message,
    });
  }
};
