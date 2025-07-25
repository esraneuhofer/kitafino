var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Buchungskonten = mongoose.model('Buchungskonten');
const { isOffensive, generateLetterCombination } = require('../utils/username-filter');

var tenantparent = new Schema({
  firstAccess: Boolean,
  firstAccessOrder: Boolean,
  registerDate: Date,
  tenantId: Schema.Types.ObjectId,
  customerId: Schema.Types.ObjectId,
  schoolId: Schema.Types.ObjectId,
  userId: Schema.Types.ObjectId,
  firstName: String,
  lastName: String,
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  city: String,
  zip: String,
  iban: String,
  username: String,
  orderSettings: {
    orderConfirmationEmail: { type: Boolean, default: true },
    displayTypeOrderWeek: Boolean,
    sendReminderBalance: { type: Boolean, default: true },
    amountBalance: { type: Number, default: 15 },
    permanentOrder: Boolean
  },
  accountDeactivated: Boolean,
  dateAccountDeactivated: Date
});

function isGermanText(str) {
  // Erlaubt: a-z, A-Z, deutsche Umlaute, ß und Leerzeichen
  const germanRegex = /^[a-zA-ZäöüÄÖÜß\s]+$/;
  return germanRegex.test(str);
}

tenantparent.pre('save', async function (next) {
  try {
    if (!this.firstName || !this.lastName) {
      throw new Error('Both firstName and lastName must be defined.');
    }

    let username;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops

    while (!isUnique && attempts < maxAttempts) {
      attempts++;
      const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generiert 4-stellige Zahl

      // Generate letter combination using utility function
      const letters = generateLetterCombination(this.firstName, this.lastName, attempts);

      // Check if the letter combination is offensive
      if (isOffensive(letters)) {
        continue; // Try again with different combination
      }

      // Kombination aus 4 Buchstaben und 4-stelliger Zahl
      username = (letters + randomDigits).toLowerCase();

      const existingStudent = await this.constructor.findOne({ username });
      if (!existingStudent) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      throw new Error('Unable to generate a unique and appropriate username after maximum attempts');
    }

    this.username = username;
    next();
  } catch (error) {
    next(error);
  }
});

// Post-save Hook für die Buchungskonto-Erstellung
tenantparent.post('save', async function (doc) {
  try {
    const userId = doc.userId;

    // Prüfen, ob bereits ein Buchungskonto für diesen Benutzer existiert
    const existingBuchungskonto = await Buchungskonten.findOne({ userId });

    if (!existingBuchungskonto) {
      // Neues Buchungskonto erstellen mit den richtigen ObjectIds
      const newBuchungskonto = new Buchungskonten({
        userId,
        customerId: doc.customerId || undefined,
        tenantId: doc.tenantId || undefined,
        customerNumber: doc.username || `User_${doc.userId}`,
        currentBalance: 0
      });

      await newBuchungskonto.save();
      console.log(`Buchungskonto für User ${userId} wurde erstellt`);
    }
  } catch (error) {
    console.error('Fehler beim Erstellen des Buchungskontos:', error);
  }
});

var Tenantparent = mongoose.model('Tenantparent', tenantparent);

module.exports = Tenantparent;
