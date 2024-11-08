const nodemailer = require('nodemailer');
const PROVIDERS = require('./Providers');
const express = require('express');
const router = express.Router();

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

// POST endpoint to send SMS
router.post('/send_sms', async (req, res) => {
  const { numbers, message, provider } = req.body;
  const senderCredentials = [process.env.SENDER_EMAIL, process.env.EMAIL_PASSWORD];

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
});

module.exports = router;
