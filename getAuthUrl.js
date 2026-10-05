require('dotenv').config();
const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// We need read-only access to Gmail
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline', // Requests a refresh token
  prompt: 'consent', // Forces consent screen to ensure refresh token is returned
  scope: SCOPES,
});

console.log("AUTH_URL:", authUrl);
