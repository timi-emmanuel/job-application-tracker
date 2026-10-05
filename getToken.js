require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');

const code = process.argv[2];

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function getAndSaveToken(authCode) {
  try {
    const { tokens } = await oAuth2Client.getToken(authCode);
    fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
    console.log('✅ Successfully exchanged code and saved token.json!');
  } catch (error) {
    console.error('❌ Error exchanging auth code for token:', error.message);
  }
}

if (!code) {
  console.error("Please provide the code as an argument.");
} else {
  getAndSaveToken(code);
}
