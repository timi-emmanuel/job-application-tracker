const { extractJobDetails } = require('./src/services/aiProcessor');
const { saveJobToNotion } = require('./src/services/notionService');

async function testFullPipeline() {
  const sampleEmail = `
Your application was sent to thco technology
Software Engineering Trainee (Fully Onsite Ikeja/Ogba)
View application on LinkedIn
  `;
  
  console.log("1. Passing email to AI for extraction...");
  const extractedData = await extractJobDetails(sampleEmail);
  
  console.log("2. Extracted Data:", extractedData);
  
  if (extractedData) {
    console.log("3. Saving to Notion...");
    await saveJobToNotion(extractedData);
  }
}

testFullPipeline();
