export function isValidIBANNumber(input: string): boolean {
  // input = 'DE' + input;
  const DE_IBAN_LENGTH = 22; // Länge eines deutschen IBANs
  const CODE_LENGTHS = {
    DE: DE_IBAN_LENGTH
  };

  // Entfernt alle nicht-alphanumerischen Zeichen und setzt den IBAN in Großbuchstaben
  let iban = input.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Entfernt das Präfix "DE", da dies als Standard angenommen wird
  iban = iban.slice(2);

  // Überprüft, ob die Länge des IBANs korrekt ist
  if (iban.length !== DE_IBAN_LENGTH - 2) {
    return false;
  }

  // Umwandlung der Buchstaben in Zahlen
  const digits = iban.replace(/[A-Z]/g, function(letter: string) {
    return (letter.charCodeAt(0) - 55).toString(); // Umwandlung in String
  });

  // Anhängen der festgelegten deutschen Landeskennung und Prüfnummern am Ende
  const rearranged = digits + '1314'; // DE entspricht 13 und E ist 14

  // Endgültige Prüfung mit Modulo 97
  return mod97(rearranged);
}


function mod97(string:string) {
  var checksum:any = string.slice(0, 2), fragment;
  for (var offset = 2; offset < string.length; offset += 7) {
    fragment = String(checksum) + string.substring(offset, offset + 7);
    checksum = parseInt(fragment, 10) % 97;
  }
  return checksum;
}

export function emailNotValid(email: string): boolean {
  var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
  return !re.test(email);
}

export function jaOrderNein(input:boolean):string {
  return input ? 'Ja' : 'Nein'
}

export function convertNumberToCurrency(input:number):string{
  let number = Math.round((input + Number.EPSILON) * 100) / 100
  return formatter.format(number)
}
const formatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});


export function roundNumberTwoDigits(input: number): number {
  return Math.round((input + Number.EPSILON) * 100) / 100;
}
