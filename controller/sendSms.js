const nodemailer = require('nodemailer');
const PROVIDERS = {
  "AT&T": { "sms": "txt.att.net", "mms": "mms.att.net", "mms_support": true },
  "Boost Mobile": { "sms": "sms.myboostmobile.com", "mms": "myboostmobile.com", "mms_support": true },
  "C-Spire": { "sms": "cspire1.com", "mms_support": false },
  "Cricket Wireless": { "sms": "sms.cricketwireless.net", "mms": "mms.cricketwireless.net", "mms_support": true },
  "Consumer Cellular": { "sms": "mailmymobile.net", "mms_support": false },
  "Google Project Fi": { "sms": "msg.fi.google.com", "mms_support": true },
  "Metro PCS": { "sms": "mymetropcs.com", "mms_support": true },
  "Mint Mobile": { "sms": "mailmymobile.net", "mms_support": false },
  "Page Plus": { "sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": true },
  "Republic Wireless": { "sms": "text.republicwireless.com", "mms_support": false },
  "Sprint": { "sms": "messaging.sprintpcs.com", "mms": "pm.sprint.com", "mms_support": true },
  "Straight Talk": { "sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": true },
  "T-Mobile": { "sms": "tmomail.net", "mms_support": true },
  "Ting": { "sms": "message.ting.com", "mms_support": false },
  "Tracfone": { "sms": "", "mms": "mmst5.tracfone.com", "mms_support": true },
  "U.S. Cellular": { "sms": "email.uscc.net", "mms": "mms.uscc.net", "mms_support": true },
  "Verizon": { "sms": "vtext.com", "mms": "vzwpix.com", "mms_support": true },
  "Virgin Mobile": { "sms": "vmobl.com", "mms": "vmpix.com", "mms_support": true },
  "Xfinity Mobile": { "sms": "vtext.com", "mms": "mypixmessages.com", "mms_support": true },
};


// Send SMS via email function
const sendSms = async (number, message, provider, senderCredentials, subject = 'NVision InOffice Messaging') => {
  const [senderEmail, emailPassword] = senderCredentials;
  const providerDomain = PROVIDERS[provider]?.sms;
  
  if (!providerDomain) {
    console.error(`Provider ${provider} not found!`);
    return { success: false, error: `Provider ${provider} not found` };
  }

  const receiverEmail = `${number}@${providerDomain}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: emailPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: senderEmail,
      to: receiverEmail,
      subject: subject,
      text: message,
    });
    console.log(`SMS sent to ${number}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send SMS to ${number}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// SMS sending handler function for the main app file
const handleSendSms = async (req, res) => {
  const { numbers, message, provider } = req.body;
  const senderCredentials = [process.env.EMAIL_USER, process.env.EMAIL_PASS];

  if (!numbers || !Array.isArray(numbers)) {
    return res.status(400).json({ error: 'Numbers must be an array' });
  }
  if (!provider || !PROVIDERS[provider]) {
    return res.status(400).json({ error: `Invalid or missing provider: ${provider}` });
  }

  // Send SMS to all numbers in parallel and collect results
  const sendResults = await Promise.all(numbers.map(number =>
    sendSms(number, message, provider, senderCredentials)
  ));

  // Check for any errors in the send results
  const failed = sendResults.filter(result => !result.success);
  const successCount = sendResults.length - failed.length;

  if (failed.length > 0) {
    return res.status(207).json({
      status: 'Partial Success',
      successCount,
      failed,
    });
  }

  return res.status(200).json({ status: 'SMS sent successfully to all numbers' });
};

module.exports = handleSendSms;
