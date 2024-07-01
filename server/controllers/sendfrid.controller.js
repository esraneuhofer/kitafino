const convertToSendGridFormat = (email) => {
  try {
    const { from, to, replyTo, subject, html, text, cc: originalCc, bcc, attachments } = email;

    if (!from) {
      throw new Error("The 'from' field is required.");
    }

    console.log('from',from);
    // Split the 'from' field into email and name if needed
    const fromParts = from.match(/(.*)<(.*)>/);
    const fromEmail = fromParts ? fromParts[2].trim() : from;
    const fromName = fromParts ? fromParts[1].trim() : '';

    // Function to split and validate emails, and remove duplicates
    const splitAndValidateEmails = (emails) => {
      if (!emails) return [];
      const emailArray = Array.isArray(emails) ? emails : emails.split(',').map(email => email.trim());
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const uniqueEmails = [...new Set(emailArray)];
      return uniqueEmails.filter(email => emailPattern.test(email));
    };

    // Ensure 'to' is always an array and filter out invalid email formats
    let toArray = splitAndValidateEmails(to);
    let cc = originalCc;

    // If 'to' is empty, but 'cc' is provided, use 'cc' as 'to'
    if (toArray.length === 0 && cc) {
      toArray = splitAndValidateEmails(cc);
      cc = ''; // Clear 'cc' since it's being used as 'to'
    }

    if (toArray.length === 0) {
      throw new Error("Mindestens eine valide Email Adresse wird benötigt.");
    }

    const personalizations = [{
      to: toArray.map(email => ({ email })),
      subject: subject || 'No Subject'
    }];

    // Create a set of 'to' emails for unique validation
    const toEmailsSet = new Set(toArray);

    if (cc) {
      let ccArray = splitAndValidateEmails(cc);
      // Filter out emails that are already in the 'to' field
      ccArray = ccArray.filter(email => !toEmailsSet.has(email));
      if (ccArray.length > 0) {
        personalizations[0].cc = ccArray.map(email => ({ email }));
      }
    }

    if (bcc) {
      let bccArray = splitAndValidateEmails(bcc);
      // Filter out emails that are already in the 'to' or 'cc' fields
      bccArray = bccArray.filter(email => !toEmailsSet.has(email));
      if (bccArray.length > 0) {
        personalizations[0].bcc = bccArray.map(email => ({ email }));
      }
    }

    const mailOptions = {
      personalizations: personalizations,
      from: { email: fromEmail },
      content: []
    };

    if (fromName) {
      mailOptions.from.name = fromName;
    }

    if (replyTo) {
      const replyToArray = splitAndValidateEmails(replyTo);
      if (replyToArray.length > 0) {
        mailOptions.reply_to = { email: replyToArray[0] }; // SendGrid only supports one reply-to address
      } else {
        throw new Error("Invalid 'replyTo' email address.");
      }
    }

    if (html) {
      mailOptions.content.push({ type: "text/html", value: html });
    } else if (text) {
      mailOptions.content.push({ type: "text/plain", value: text });
    } else {
      mailOptions.content.push({ type: "text/plain", value: " " });
    }

    if (attachments) {
      mailOptions.attachments = attachments.map(attachment => {
        if (!attachment.filename || !attachment.content) {
          throw new Error("Attachments must include 'filename' and 'content'.");
        }
        return {
          filename: attachment.filename,
          content: attachment.content,
          type: attachment.type || 'application/pdf',
          disposition: attachment.disposition || 'attachment',
          content_id: attachment.content_id,
          encoding: attachment.encoding || 'base64'
        };
      });
    }

    let copy = JSON.parse(JSON.stringify(mailOptions));
    delete copy.attachments;
    return mailOptions;
  } catch (error) {
    console.error('Error in convertToSendGridFormat:', error.message);
    throw error;  // rethrow the error to be handled by the caller
  }
};


module.exports = {
  convertToSendGridFormat
}
