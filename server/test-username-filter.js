/**
 * Test script for username filter functionality
 * Run with: node test-username-filter.js
 */

const { isOffensive, generateLetterCombination, sanitizeName } = require('./utils/username-filter');

// Test cases for problematic names
const testCases = [
  // Names that could create offensive combinations
  { firstName: 'Nadine', lastName: 'Zimmer', expected: 'nazi' },
  { firstName: 'Conrad', lastName: 'Ckens', expected: 'cock' },
  { firstName: 'Dieter', lastName: 'Ckmann', expected: 'dick' },
  { firstName: 'Fulbert', lastName: 'Ckner', expected: 'fuck' },
  { firstName: 'Heinrich', lastName: 'Llmann', expected: 'hell' },
  { firstName: 'Helmut', lastName: 'Llebrand', expected: 'hell' },
  { firstName: 'Sebastian', lastName: 'Xander', expected: 'sex' },
  { firstName: 'Sven', lastName: 'Exmann', expected: 'sex' },

  // German names that could be problematic
  { firstName: 'Armin', lastName: 'Schrader', expected: 'arsch' },
  { firstName: 'Friedrich', lastName: 'Ckert', expected: 'fick' },

  // Safe combinations
  { firstName: 'Max', lastName: 'Mustermann', expected: 'safe' },
  { firstName: 'Anna', lastName: 'Schmidt', expected: 'safe' },
  { firstName: 'Peter', lastName: 'Weber', expected: 'safe' }
];

console.log('=== Username Filter Test ===\n');

// Test sanitizeName function
console.log('Testing sanitizeName function:');
console.log('Müller →', sanitizeName('Müller'));
console.log('Schäfer →', sanitizeName('Schäfer'));
console.log('Weiß →', sanitizeName('Weiß'));
console.log('José →', sanitizeName('José'));
console.log("O'Connor →", sanitizeName("O'Connor"));
console.log('');

// Test isOffensive function
console.log('Testing isOffensive function:');
console.log('nazi →', isOffensive('nazi'));
console.log('cock →', isOffensive('cock'));
console.log('maxm →', isOffensive('maxm'));
console.log('ansc →', isOffensive('ansc'));
console.log('');

// Test generateLetterCombination function
console.log('Testing generateLetterCombination with problematic names:');

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.firstName} ${testCase.lastName}`);

  let foundSafeCombination = false;
  let attempts = 1;
  const maxAttempts = 10;

  while (!foundSafeCombination && attempts <= maxAttempts) {
    const letters = generateLetterCombination(testCase.firstName, testCase.lastName, attempts);
    const isOffensiveResult = isOffensive(letters);

    console.log(`  Attempt ${attempts}: ${letters} - ${isOffensiveResult ? 'OFFENSIVE' : 'SAFE'}`);

    if (!isOffensiveResult) {
      foundSafeCombination = true;
      console.log(`  ✅ Found safe combination: ${letters}`);
    }

    attempts++;
  }

  if (!foundSafeCombination) {
    console.log(`  ❌ Could not find safe combination after ${maxAttempts} attempts`);
  }
});

// Test complete username generation simulation
console.log('\n=== Complete Username Generation Simulation ===');

const simulateUsernameGeneration = (firstName, lastName) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const letters = generateLetterCombination(firstName, lastName, attempts);

    if (!isOffensive(letters)) {
      const username = (letters + randomDigits).toLowerCase();
      return { username, attempts, letters };
    }
  }

  return { username: null, attempts, letters: null };
};

// Test with some problematic names
const problematicNames = [
  ['Nadine', 'Zimmer'],
  ['Conrad', 'Ckens'],
  ['Friedrich', 'Ckert'],
  ['Heinrich', 'Llmann']
];

problematicNames.forEach(([firstName, lastName]) => {
  const result = simulateUsernameGeneration(firstName, lastName);
  if (result.username) {
    console.log(
      `${firstName} ${lastName} → ${result.username} (attempts: ${result.attempts}, letters: ${result.letters})`
    );
  } else {
    console.log(`${firstName} ${lastName} → FAILED to generate safe username`);
  }
});

console.log('\n=== Test Complete ===');
