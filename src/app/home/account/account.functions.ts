export function maskIBAN(iban:string):string {

  // Extract the country code (first two characters)
  const countryCode = iban.slice(0, 2);

  // Remove the country code and all non-alphanumeric characters for processing
  const sanitizedIBAN = iban.slice(2).replace(/\s+/g, '');

  // Get the length of the sanitized IBAN
  const ibanLength = sanitizedIBAN.length;

  // Ensure the IBAN is long enough to mask
  if (ibanLength <= 6) {
    throw new Error('IBAN is too short to mask');
  }

  // Mask all characters except the last 6
  const maskedPart = 'X'.repeat(ibanLength - 6);
  const lastSixDigits = sanitizedIBAN.slice(-6);

  // Combine the masked part with the last 6 characters
  const maskedIBAN = maskedPart + lastSixDigits;

  // Add the country code back and format the masked IBAN into groups of four characters
  const formattedMaskedIBAN = (countryCode + maskedIBAN).replace(/(.{4})(?=.)/g, '$1 ');

  return formattedMaskedIBAN;
}
