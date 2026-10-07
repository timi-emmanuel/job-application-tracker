require('dotenv').config();

async function extractJobDetails(emailText) {
  try {
    const prompt = `
You are a precise data extraction bot. Extract job application details from emails.

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

    // Fetch the API Key
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY in .env file!");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    const extractedData = JSON.parse(responseText);
    
    return extractedData;
  } catch (error) {
    console.error("Error extracting details:", error);
    return null;
  }
}

module.exports = {
  extractJobDetails
};
