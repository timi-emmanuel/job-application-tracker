require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_DATABASE_ID;

async function insertRow() {
  try {
    const response = await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        "S/N": {
          title: [
            { text: { content: "1" } }
          ]
        },
        "Company": {
          rich_text: [
            { text: { content: "Google" } }
          ]
        },
        "Role": {
          rich_text: [
            { text: { content: "Frontend Engineer" } }
          ]
        },
        "Staus": {
          multi_select: [
            { name: "Applied" }
          ]
        }
      }
    });
    console.log("✅ Successfully inserted a row! Check your Notion!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

insertRow();
