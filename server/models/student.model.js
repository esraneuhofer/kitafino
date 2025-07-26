var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const { isOffensive, generateLetterCombination } = require('../utils/username-filter');

var studentSchema = new Schema({
  specialFood: Schema.Types.ObjectId,
  firstName: String,
  lastName: String,
  subgroup: String,
  tenantId: Schema.Types.ObjectId,
  customerId: Schema.Types.ObjectId,
  schoolId: Schema.Types.ObjectId,
  userId: Schema.Types.ObjectId,
  registerDate: {
    type: Date,
    default: Date.now // Set the default value to the current date and time
  },
  username: String, // Add the username field
  butFrom: String,
  butTo: String,
  butDaysPerWeek: Number,
  isActive: { type: Boolean, default: true },
  dateAccountDeactivated: Date,
  isPaedagogisch: Boolean
});

// Define the middleware function before creating the model
studentSchema.pre('save', async function (next) {
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

      // Generate the username based on firstName, lastName, and a random 4-digit number
      const randomDigits = Math.floor(1000 + Math.random() * 9000);

      // Generate letter combination using utility function
      const letters = generateLetterCombination(this.firstName, this.lastName, attempts);

      // Check if the letter combination is offensive
      if (isOffensive(letters)) {
        continue; // Try again with different combination
      }

      username = (letters + randomDigits).toLowerCase();

      // Check if the generated username is unique
      const existingStudent = await this.constructor.findOne({ username });
      if (!existingStudent) {
        // If the username is unique, break out of the loop
        isUnique = true;
      }
    }

    if (!isUnique) {
      throw new Error('Unable to generate a unique and appropriate username after maximum attempts');
    }

    // Set the unique username
    this.username = username;
    next();
  } catch (error) {
    next(error);
  }
});

var StudentNew = mongoose.model('StudentNew', studentSchema);

module.exports = StudentNew;
