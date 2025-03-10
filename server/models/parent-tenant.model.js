var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var tenantparent = new Schema({
  firstAccess:Boolean,
  firstAccessOrder:Boolean,
  registerDate:Date,
  tenantId:Schema.Types.ObjectId,
  customerId:Schema.Types.ObjectId,
  schoolId:Schema.Types.ObjectId,
  userId:Schema.Types.ObjectId,
  firstName:String,
  lastName:String,
  email: {type: String, required: true},
  phone: {type: String, required: true},
  address:String,
  city:String,
  zip:String,
  iban:String,
  username:String,
  orderSettings:{
    orderConfirmationEmail:Boolean,
    displayTypeOrderWeek:Boolean,
    sendReminderBalance:Boolean,
    amountBalance:Number,
    permanentOrder:Boolean,
  }
});

function isGermanText(str) {
  // Erlaubt: a-z, A-Z, deutsche Umlaute, ß und Leerzeichen
  const germanRegex = /^[a-zA-ZäöüÄÖÜß\s]+$/;
  return germanRegex.test(str);
}


// Beispiel-Hilfsfunktion (inkl. deutscher Umlaute)
function sanitizeName(str) {
  // Erst Umlaute/ß gezielt austauschen
  str = str
    .replace(/ß/g, 'ss')
    .replace(/ä/g, 'ae')
    .replace(/Ä/g, 'Ae')
    .replace(/ö/g, 'oe')
    .replace(/Ö/g, 'Oe')
    .replace(/ü/g, 'ue')
    .replace(/Ü/g, 'Ue');

  // Danach etwaige Akzente (z. B. á, é, etc.) entfernen
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

tenantparent.pre('save', async function (next) {
  try {
    if (!this.firstName || !this.lastName) {
      throw new Error('Both firstName and lastName must be defined.');
    }

    // VOR dem Zusammenbauen die Strings "säubern"
    const cleanFirst = sanitizeName(this.firstName);
    const cleanLast = sanitizeName(this.lastName);

    let username;
    let isUnique = false;

    while (!isUnique) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generiert 4-stellige Zahl

      // Stelle sicher, dass wir exakt 4 Buchstaben haben
      let letters = '';

      // Nimm so viele Buchstaben vom Vornamen wie möglich (max. 2)
      letters += cleanFirst.slice(0, 2);

      // Fülle mit Buchstaben vom Nachnamen auf bis zu 4 Buchstaben erreicht sind
      const remainingLettersNeeded = 4 - letters.length;
      letters += cleanLast.slice(0, remainingLettersNeeded);

      // Falls immer noch nicht 4 Buchstaben erreicht sind, fülle mit 'x' auf
      while (letters.length < 4) {
        letters += 'x';
      }

      // Kombination aus 4 Buchstaben und 4-stelliger Zahl
      username = (letters + randomDigits).toLowerCase();

      const existingStudent = await this.constructor.findOne({ username });
      if (!existingStudent) {
        isUnique = true;
      }
    }

    this.username = username;
    next();
  } catch (error) {
    next(error);
  }
});


var Tenantparent = mongoose.model('Tenantparent', tenantparent);

module.exports = Tenantparent;

