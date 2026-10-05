require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_DATABASE_ID;

/**
 * Fetches all existing Email IDs from Notion to prevent duplicates
 */
async function getProcessedEmailIds() {
  try {
    let hasMore = true;
    let cursor = undefined;
    const existing = new Set();

    while (hasMore) {
      const body = cursor ? { start_cursor: cursor } : {};
      
      const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      for (const page of data.results) {
        const emailIdProp = page.properties.EmailID?.rich_text;
        if (emailIdProp && emailIdProp.length > 0) {
          existing.add(emailIdProp[0].text.content);
        }
      }

      hasMore = data.has_more;
      cursor = data.next_cursor;
    }
    return Array.from(existing);
  } catch (error) {
    console.error("Error fetching existing Notion jobs:", error.message);
    return [];
  }
}

/**
 * Saves an extracted job application to Notion
 * @param {Object} jobData
 */
async function saveJobToNotion(jobData) {
  try {
    const sn = new Date().getTime().toString().slice(-4); 

    const response = await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        "S/N": {
          title: [
            { text: { content: sn } }
          ]
        },
        "Company": {
          rich_text: [
            { text: { content: jobData.Company || "Unknown" } }
          ]
        },
        "Role": {
          rich_text: [
            { text: { content: jobData.Role || "Unknown" } }
          ]
        },
        "Status": {
          multi_select: [
            { name: jobData.Status || "Applied" }
          ]
        },
        "Date": {
          date: {
            start: jobData.Date || new Date().toISOString()
          }
        },
        "EmailID": {
          rich_text: [
            { text: { content: jobData.EmailID || "" } }
          ]
        }
      }
    });
    
    console.log(`✅ Successfully saved to Notion: ${jobData.Company} - ${jobData.Role}`);
    return response;
  } catch (error) {
    console.error("❌ Error saving to Notion:", error.message);
    throw error;
  }
}

module.exports = {
  saveJobToNotion,
  getProcessedEmailIds
};
