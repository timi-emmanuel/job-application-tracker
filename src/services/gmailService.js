const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../../token.json');
function getGmailClient() {
  let credentials, token;

  // Cloud-ready: Read from environment variables if they exist
  if (process.env.GOOGLE_CREDENTIALS) {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  }

  if (process.env.GOOGLE_TOKEN) {
    token = JSON.parse(process.env.GOOGLE_TOKEN);
  } else {
    token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  }

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  oAuth2Client.setCredentials(token);
  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

async function fetchNewJobEmails() {
  const gmail = getGmailClient();
  
  // This query looks for emails in the last 30 days containing typical job keywords
  const query = 'newer_than:30d ("application" OR "applied" OR "interview" OR "role" OR "position")';
  
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20
    });

    const messages = res.data.messages || [];
    if (messages.length === 0) {
      console.log('No recent job-related emails found.');
      return [];
    }

    const emailContents = [];

    for (const message of messages) {
      // Add a small delay to prevent Gmail API rate limit (Quota exceeded)
      await new Promise(resolve => setTimeout(resolve, 250));

      const msgData = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });
      
      const payload = msgData.data.payload;
      
      let body = '';
      // A naive extraction of the text body
      if (payload.parts) {
        const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart && textPart.body && textPart.body.data) {
           body = Buffer.from(textPart.body.data, 'base64').toString('utf8');
        } else if (payload.parts[0].parts) {
           // Sometimes it's nested
           const nestedPart = payload.parts[0].parts.find(p => p.mimeType === 'text/plain');
           if (nestedPart && nestedPart.body && nestedPart.body.data) {
             body = Buffer.from(nestedPart.body.data, 'base64').toString('utf8');
           }
        }
      } else if (payload.body && payload.body.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf8');
      }
      
      // Fallback: If we can't find plain text, try to extract snippet
      if (!body) {
        body = msgData.data.snippet;
      }

      // Get Subject & Date
      const subjectHeader = payload.headers.find(h => h.name === 'Subject');
      const subject = subjectHeader ? subjectHeader.value : 'No Subject';
      
      const dateHeader = payload.headers.find(h => h.name === 'Date');
      const emailDate = dateHeader ? new Date(dateHeader.value).toISOString() : new Date().toISOString();

      emailContents.push({
        id: message.id,
        subject: subject,
        text: body,
        date: emailDate
      });
    }

    return emailContents;
  } catch (error) {
    console.error('Error fetching emails:', error.message);
    return [];
  }
}

module.exports = {
  fetchNewJobEmails
};
