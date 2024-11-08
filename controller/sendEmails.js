const nodemailer = require('nodemailer');
require('dotenv').config();
const { Buffer } = require('buffer');

const sendEmails = async (req, res) => {
  try {
    // Extract JSON fields from request body
    const { name, bcc, subject, message, image } = req.body;

    // Validate required fields
    if (!name || !bcc || !subject || !message) {
      return res.status(400).json({ error: 'Name, BCC, subject, and message are required.' });
    }

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Convert bcc to an array of email addresses, trim whitespaces, and filter valid emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic regex for email validation
    const bccList = bcc
      .split(',')
      .map(email => email.trim())
      .filter(email => emailRegex.test(email)); // Keep only valid emails

    // Helper function to send a batch of emails
    const sendBatchEmails = async (batch) => {
      const mailOptions = {
        from: process.env.EMAIL_USER, // Sender's email
        bcc: batch, // Send batch of emails as BCC
        subject: subject,
        text: message, // Plain text message
      };

      // Add image as an attachment if provided
      if (image) {
        // Check and strip any prefix from the base64 string
        const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
        mailOptions.attachments = [
          {
            filename: 'image.png', // Set a default filename or get from additional metadata if available
            content: base64Image, // Use the stripped base64 image content
            encoding: 'base64', // Specify encoding format
          },
        ];
      }

      try {
        // Send the email
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('Error sending batch:', error);
        throw error;
      }
    };

    // Split the bcc list into batches of 99 emails (Google's limit for BCC recipients)
    const chunkSize = 99;
    const batches = [];
    for (let i = 0; i < bccList.length; i += chunkSize) {
      const batch = bccList.slice(i, i + chunkSize);
      batches.push(batch);
    }

    // Send each batch sequentially
    for (const batch of batches) {
      await sendBatchEmails(batch); // Send one batch at a time
    }

    return res.status(200).json({ message: 'All emails sent successfully in batches!' });

  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = sendEmails;
