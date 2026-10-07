require('dotenv').config();
const { Zorveus } = require('@zorveus/sdk');

const client = new Zorveus({
  apiKey: process.env.ZORVEUS_API_KEY,
});

async function extractJobDetails(emailText) {
  try {
    const prompt = `
You are a helpful assistant that extracts job application details from emails.

CRITICAL INSTRUCTION: First, determine if this email is an ACTUAL confirmation that the user has applied for a job, an interview invitation, OR an actual job application email that the user sent directly to a company (e.g., "I am applying for...", "Please find my CV attached").
If the email is just a job alert, job recommendation, newsletter, or marketing email, it is NOT valid.

If the email IS a valid application confirmation or interview invite, extract the Company Name, the Job Role, and the Application Status.
Respond ONLY with a valid JSON object in this exact format:
{
  "Valid": true,
  "Company": "Name of company",
  "Role": "Name of role",
  "Status": "Applied" // Or "Interview"
}

If it is NOT a valid application email (e.g. a job alert), respond ONLY with:
{
  "Valid": false
}

Email Text:
"""
${emailText}
"""
`;

    const completion = await client.chat.completions.create({
      model: "zorveus/gpt-oss-120b",
      messages: [
        { role: "system", content: "You are a precise data extraction bot. Always return pure JSON without markdown blocks." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    const extractedData = JSON.parse(responseText);
    
    return extractedData;
  } catch (error) {
    console.error("Error extracting details:", error);
    return null;
  }
}

// Simple test function if we run this file directly
async function test() {
  const sampleEmail1 = `
Congratulations Adekunle Oluwatimilehin Emmanuel,
Your application for UI Developer has been sent to the hiring team of Leaders Network.
If you are shortlisted, you’ll be contacted for an interview.
  `;
  
  console.log("Testing Email 1...");
  const result1 = await extractJobDetails(sampleEmail1);
  console.log(result1);
}

if (require.main === module) {
  test();
}

module.exports = {
  extractJobDetails
};
