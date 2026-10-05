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
      const response = await notion.databases.query({
        database_id: dbId,
        start_cursor: cursor,
      });

      for (const page of response.results) {
        const emailIdProp = page.properties.EmailID?.rich_text;
        if (emailIdProp && emailIdProp.length > 0) {
          existing.add(emailIdProp[0].text.content);
        }
      }

      hasMore = response.has_more;
      cursor = response.next_cursor;
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
