const express = require('express');
const router = express.Router();
// const { processEmail } = require('../services/emailProcessor');

// Endpoint for Google Cloud Pub/Sub to hit when a new email arrives
router.post('/gmail', async (req, res) => {
  try {
    // Gmail pushes messages in req.body.message.data (base64 encoded)
    const pubSubMessage = req.body.message;
    
    if (pubSubMessage && pubSubMessage.data) {
      const decodedData = Buffer.from(pubSubMessage.data, 'base64').toString();
      const payload = JSON.parse(decodedData);
      
      console.log('Received webhook notification from Gmail:', payload.emailAddress);
      
      // TODO: Fetch the actual email content using Gmail API
      // TODO: Pass content to AI for extraction
      // TODO: Save to Notion
      
      // Acknowledge the message so Pub/Sub doesn't retry
      res.status(200).send('Message acknowledged');
    } else {
      res.status(400).send('Bad Request: Invalid Pub/Sub message format');
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Send 500 so Pub/Sub knows to retry later if it's a transient error
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
