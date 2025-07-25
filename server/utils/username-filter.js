/**
 * Username Filter Utility
 * Provides functionality to filter out offensive/inappropriate username combinations
 */

// List of offensive/inappropriate letter combinations to avoid (max 4 characters)
const offensiveWords = [
  // English offensive words (4 characters or less)
  'nazi',
  'cock',
  'dick',
  'fuck',
  'shit',
  'damn',
  'hell',
  'piss',
  'porn',
  'sexy',
  'slut',
  'hate',
  'kill',
  'dead',
  'rape',
  'blow',
  'suck',
  'cunt',
  'tits',
  'butt',
  'nude',
  'sex',
  'xxx',

  // German offensive words (4 characters or less)
  'fick',
  'popo',
  'wichs',
  'kack',
  'hure',
  'pipi',

  // Political/extremist terms (4 characters or less)
  'isis',
  'bomb',
  'drug',
  'dope',

  // Additional problematic combinations (4 characters or less)
  'noob',
  'newb',
  'leet',
  'hack',
  'spam',
  'root',
  'test',
  'demo',
  'user',
  'null',
  'void',

  // 3-letter combinations that are problematic
  'fag',
  'gay',
  'ass',
  'tit',
  'cum',
  'wtf',
  'omg',
  'lol',
  'hot',
  'bad',

  // 2-letter combinations that could be problematic in context
  'kk',
  'ss',
  'hh'
];

/**
 * Check if a letter combination contains or is contained in offensive words
 * @param {string} letters - The letter combination to check
 * @returns {boolean} - True if offensive, false otherwise
 */
function isOffensive(letters) {
  const lowerLetters = letters.toLowerCase();

  // Check for exact matches and partial matches
  return offensiveWords.some((word) => {
    // Check if the letters form an offensive word
    return (
      lowerLetters === word ||
      // Check if letters contain an offensive word
      lowerLetters.includes(word) ||
      // Check if an offensive word contains the letters (for short combinations)
      (letters.length <= 3 && word.includes(lowerLetters))
    );
  });
}

/**
 * Sanitize names by removing special characters and converting umlauts
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitizeName(str) {
  if (!str) return '';

  return (
    str
      // Convert German umlauts and ß
      .replace(/ß/g, 'ss')
      .replace(/ä/g, 'ae')
      .replace(/Ä/g, 'Ae')
      .replace(/ö/g, 'oe')
      .replace(/Ö/g, 'Oe')
      .replace(/ü/g, 'ue')
      .replace(/Ü/g, 'Ue')
      // Remove diacritics
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      // Remove any non-letter characters
      .replace(/[^a-zA-Z]/g, '')
  );
}

/**
 * Generate alternative letter combinations to avoid offensive words
 * @param {string} firstName - The first name
 * @param {string} lastName - The last name
 * @param {number} attempt - The attempt number (for different strategies)
 * @returns {string} - A 4-letter combination
 */
function generateLetterCombination(firstName, lastName, attempt = 1) {
  const cleanFirst = sanitizeName(firstName);
  const cleanLast = sanitizeName(lastName);

  let letters = '';

  if (attempt === 1) {
    // First attempt: normal combination (2+2)
    letters = cleanFirst.slice(0, 2) + cleanLast.slice(0, 2);
  } else if (attempt <= 5) {
    // Alternative combinations: vary the split
    const firstSlice = Math.min(cleanFirst.length, Math.max(1, attempt % 4));
    const lastSlice = 4 - firstSlice;
    letters = cleanFirst.slice(0, firstSlice) + cleanLast.slice(0, lastSlice);
  } else if (attempt <= 10) {
    // Try taking from different positions
    const firstStart = (attempt - 6) % Math.max(1, cleanFirst.length - 1);
    const lastStart = (attempt - 6) % Math.max(1, cleanLast.length - 1);
    letters = cleanFirst.slice(firstStart, firstStart + 2) + cleanLast.slice(lastStart, lastStart + 2);
  } else {
    // More random approach for difficult cases
    const combined = cleanFirst + cleanLast;
    if (combined.length >= 4) {
      const startPos = Math.floor(Math.random() * Math.max(1, combined.length - 3));
      letters = combined.slice(startPos, startPos + 4);
    } else {
      letters = combined;
    }
  }

  // Ensure we have exactly 4 characters
  while (letters.length < 4) {
    letters += 'x';
  }

  return letters.slice(0, 4);
}

module.exports = {
  isOffensive,
  sanitizeName,
  generateLetterCombination,
  offensiveWords // Export for testing purposes
};
