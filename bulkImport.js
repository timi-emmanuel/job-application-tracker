require('dotenv').config();
const { getGmailClient } = require('./src/services/gmailService');
const { extractJobDetails } = require('./src/services/aiProcessor');
const { saveJobToNotion, getProcessedEmailIds } = require('./src/services/notionService');

async function runBulkImport() {
  console.log("🚀 Starting Bulk Import (This will take a while to respect API limits!)...");
  
  const gmail = getGmailClient();
  const processedIds = await getProcessedEmailIds();
  const query = 'newer_than:30d ("application" OR "applied" OR "interview" OR "role" OR "position")';

  try {
    console.log("🔍 Fetching email list from Gmail...");
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 300
    });

    const messages = res.data.messages || [];
    if (messages.length === 0) {
      console.log('No recent job-related emails found.');
      return;
    }

    console.log(`📥 Found ${messages.length} total emails. Checking against Notion...`);

    for (const message of messages) {
      if (processedIds.includes(message.id)) {
        continue;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      try {
        const msgData = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });

        const headers = msgData.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        console.log(`\nProcessing Email: "${subject}"`);

        let text = '';
        if (msgData.data.payload.parts) {
          const part = msgData.data.payload.parts.find(p => p.mimeType === 'text/plain');
          if (part && part.body.data) text = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (msgData.data.payload.body?.data) {
          text = Buffer.from(msgData.data.payload.body.data, 'base64').toString('utf-8');
        }

        await new Promise(resolve => setTimeout(resolve, 4500));
        
        const jobData = await extractJobDetails(text || subject);
        
        if (jobData && jobData.Company !== "Unknown") {
          console.log(`💬 AI Extracted: ${jobData.Company} | ${jobData.Role} | ${jobData.Status}`);
          await saveJobToNotion({
            ...jobData,
            Date: new Date(Number(msgData.data.internalDate)).toISOString(),
            EmailID: message.id 
          });
        } else {
          console.log("⚠️ AI determined this was not a valid job application email. Skipping.");
        }
      } catch (e) {
        console.log(`❌ Error processing email: ${e.message}`);
      }
    }
    console.log("✅ Bulk Import Complete!");
  } catch (error) {
    console.error("❌ Bulk Import failed:", error.message);
  }
}

runBulkImport();
