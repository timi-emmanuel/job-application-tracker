require('dotenv').config();
const { Zorveus } = require('@zorveus/sdk');

const client = new Zorveus({
  apiKey: process.env.ZORVEUS_API_KEY,
});

async function listModels() {
  try {
    const response = await client.models.list();
    const geminiModels = response.data.filter(m => m.id.includes('gemini'));
    console.log("Gemini Models:", geminiModels.map(m => m.id));
  } catch (error) {
    console.error("Error:", error.message);
  }
}
listModels();
