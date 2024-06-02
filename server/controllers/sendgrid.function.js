const convertToSendGridFormat = (mailOptions) => {
  const { to, cc, bcc } = mailOptions;

  // Helper function to split, trim, and remove duplicates
  const splitAndTrim = (str) => str ? str.split(',').map(email => email.trim()).filter(Boolean) : [];

  const toEmails = new Set(splitAndTrim(to));
  const ccEmails = new Set(splitAndTrim(cc));
  const bccEmails = new Set(splitAndTrim(bcc));

  // Remove duplicates from cc and bcc that are in to
  ccEmails.forEach(email => {
    if (toEmails.has(email)) {
      ccEmails.delete(email);
    }
  });

  bccEmails.forEach(email => {
    if (toEmails.has(email) || ccEmails.has(email)) {
      bccEmails.delete(email);
    }
  });

  return {
    ...mailOptions,
    to: Array.from(toEmails).join(','),
    cc: Array.from(ccEmails).join(','),
    bcc: Array.from(bccEmails).join(',')
  };
};

module.exports = {
  convertToSendGridFormat
}
