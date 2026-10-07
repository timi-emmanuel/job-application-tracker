const cron = require('node-cron');
const { fetchNewJobEmails, markAsProcessed } = require('../services/gmailService');
const { extractJobDetails } = require('../services/aiProcessor');
const { saveJobToNotion, getProcessedEmailIds } = require('../services/notionService');

async function runJobTrackerPipeline() {
  console.log(`[${new Date().toISOString()}] Running Job Tracker Pipeline...`);
  
  try {
    const emails = await fetchNewJobEmails();
    
    if (emails.length === 0) {
      console.log('✅ Pipeline finished. No new emails to process.');
      return;
    }

    // Fetch already processed emails from Notion to prevent duplicates
    const processedIds = await getProcessedEmailIds();
    
    console.log(`Found ${emails.length} new potential job emails.`);

    for (const email of emails) {
      if (processedIds.includes(email.id)) {
        continue;
      }
      
      console.log(`\nProcessing Email: "${email.subject}"`);
      
      // Add a 4.5 second delay to respect Gemini's free tier limit of 15 Requests Per Minute
      await new Promise(resolve => setTimeout(resolve, 4500));

      // 2. Use AI (Zorveus) to extract the structured data
      const jobData = await extractJobDetails(email.text || email.subject);
      
      if (jobData && jobData.Valid && jobData.Company && jobData.Company !== "Unknown") {
        jobData.Date = email.date; // Attach date from email metadata
        jobData.EmailID = email.id; // Store ID to prevent duplicates later
        console.log(`🧠 AI Extracted: ${jobData.Company} | ${jobData.Role} | ${jobData.Status}`);
        
        // 3. Save to Notion
        await saveJobToNotion(jobData);
        console.log(`✅ Saved to Notion!`);
      } else {
        console.log('⚠️ AI determined this was not a valid job application email. Skipping.');
      }
    }

  } catch (error) {
    console.error('❌ Pipeline Error:', error.message);
  }
}

// Schedule the cron job to run every 10 minutes
function startCron() {
  console.log("🕒 Starting Job Tracker Cron Scheduler (runs every 10 minutes)");
  
  // Run immediately on startup
  runJobTrackerPipeline();
  
  // Schedule for every day at 12:00 AM
  cron.schedule('0 0 * * *', () => {
    runJobTrackerPipeline();
  });
}

module.exports = {
  startCron,
  runJobTrackerPipeline // Exporting this for manual testing
};
