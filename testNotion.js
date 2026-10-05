require('dotenv').config();

const dbId = '3ef41813e58980029fa1e44e88e88f6c';
const token = process.env.NOTION_API_KEY;

async function retrieveDatabase() {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
      }
    });
    const data = await response.json();
    console.log("✅ Retrieve status:", response.status);
    console.log(JSON.stringify(data.properties, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

retrieveDatabase();
