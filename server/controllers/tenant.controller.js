const mongoose = require("mongoose");
const TenantParent = mongoose.model("Tenantparent");
const AccountSchema = mongoose.model("AccountSchema");
const { logUserAction, getChangeTenant } = require("./action_log.controller");

module.exports.getTenantInformation = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const tenantModel = await TenantParent.findOne({ userId: req._id });
    // Sending the result back to the client
    res.json(tenantModel);
  } catch (err) {
    console.error("Vertragspartner Informationen:", err); // Log the error for debugging
    res.status(500).json({
      message: "Vertragspartner Informationen konnte nicht geladen werden",
      error: err.message,
    });
  }
};

module.exports.editParentTenant = (req, res, next) => {
  TenantParent.findOneAndUpdate({ _id: req.body._id }, req.body, {
    upsert: true,
    new: true,
  })
    .then((doc) => {
      res.send(doc);
      logUserAction(
        req._id, // userId
        req.tenantId, // tenantId
        "TENANT_AENDERN", // actionType
        getChangeTenant(req.body)
      ).catch((err) => {
        // Stille Fehlerbehandlung - beeinflusst den Hauptprozess nicht
        console.error("Fehler beim Logging der Tenant-Änderung:", err); // Kleine Korrektur in der Fehlermeldung
      });
    })
    .catch((err) => {
      return res.status(500).send({ error: err });
    });
};

module.exports.addTenantAndAccount = async (req, res, next) => {
  // Validate required input
  if (!req.body.firstName || !req.body.lastName) {
    return res.status(400).json({
      error: true,
      message: "Both firstname and lastname must be provided.",
    });
  }

  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    // Diese beiden Variablen fangen die Rückgabewerte auf
    const tenantParent = await addTenantParent(req, session);
    const account = await addAccount(req, session);

    // Commit the transaction before sending response or doing additional operations
    await session.commitTransaction();

    // Move the logging outside of the transaction's critical path
    try {
      await logUserAction(
        req._id, // userId
        req.tenantId, // tenantId
        "TENANT_ANLEGEN", // Bessere Beschreibung als "ANMELDEN"
        {
          idObject: tenantParent.tenant._id,
          tenant: getChangeTenant(tenantParent.tenant),
          account: {
            accountId: account.account._id,
            email: account.account.email,
            // weitere wichtige Account-Informationen
          },
        }
      );
    } catch (loggingError) {
      // Just log the error but don't affect the response
      console.error(
        "Fehler beim Logging der Erstellung des Kundenkontos:",
        loggingError
      );
    }

    // Send response after transaction is committed
    res.json({ success: true, message: "Kundenkonto erfolgreich angelegt" });
  } catch (error) {
    // Only abort if the transaction hasn't been committed yet
    if (session.transaction.state !== "TRANSACTION_COMMITTED") {
      await session.abortTransaction();
    }
    console.error("Error during transaction:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

async function addAccount(req, session) {
  let newAccount = new AccountSchema({
    userId: req._id,
    customerId: req.customerId,
    tenantId: req.tenantId,
    currentBalance: 0,
  });

  if (
    req.customerId.toString() === "6540b2117d2b64903bb4e3a2" ||
    req.customerId.toString() === "67f69b858d2c0d2b35c781ec"
  ) {
    newAccount.currentBalance = 100;
  }
  try {
    await newAccount.save({ session });
    return {
      success: true,
      message: "Account Kunde erfolgreich angelegt",
      account: newAccount,
    };
  } catch (error) {
    handleOrderError(error);
  }
}
async function addTenantParent(req, session) {
  let newTenant = new TenantParent({
    firstAccess: true,
    firstAccessOrder: true,
    registerDate: new Date(),
    schoolId: req.project_id,
    userId: req._id,
    customerId: req.customerId,
    tenantId: req.tenantId,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    city: req.body.city,
    zip: req.body.zip,
    orderSettings: {
      orderConfirmationEmail: true,
      sendReminderBalance: true,
      amountBalance: 15,
      permanentOrder: false,
    },
  });

  try {
    await newTenant.save({ session });
    return {
      success: true,
      message: "Kundenkonto erfolgreich angelegt",
      tenant: newTenant,
    };
  } catch (error) {
    handleOrderError(error);
  }
}

function handleOrderError(error) {
  let httpStatusCode = 500; // Default to Internal Server Error
  let userMessage =
    "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";

  console.error("Error during order saving:", error); // Detailed logging for internal use
  if (error.code === 11000) {
    httpStatusCode = 409; // Conflict
    userMessage =
      "Ein doppelter Eintrag wurde erkannt. Bitte überprüfen Sie den Eintrag oder wenden Sie sich an unseren Kundenservice.";
  } else if (error.name && error.name === "ValidationError") {
    httpStatusCode = 400; // Bad Request
    userMessage =
      "Validierungsfehler. Bitte überprüfen Sie die eingegebenen Daten oder wenden Sie sich an unseren Kundenservice";
  }

  const customError = new Error(userMessage);
  customError.status = httpStatusCode;
  throw customError;
}
