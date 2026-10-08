require('dotenv').config();
const { Zorveus } = require('@zorveus/sdk');

const client = new Zorveus({
  apiKey: process.env.ZORVEUS_API_KEY,
});

async function extractJobDetails(emailText) {
  try {
    const prompt = `
You are a precise data extraction bot. Extract job application details from emails.

CRITICAL INSTRUCTION: First, determine if this text clearly indicates a job application, an interview invite, or a confirmation.
If the text says something like "Your application to [Role] at [Company]" or "Thank you for applying", it IS VALID, even if it is just a single sentence or a subject line. Do not reject it just because it's short.
If the email is clearly a newsletter, job alert, or marketing email, mark it as NOT valid.

If it IS a valid application or interview invite, extract the Company Name, the Job Role, and the Application Status.
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
${emailText.substring(0, 600)}
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
    console.error("Error extracting details:", error.message || error);
    return null;
  }
}

module.exports = {
  extractJobDetails
};
