require('dotenv').config();
const express = require('express');
const { startCron } = require('./src/cron/index');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Job Tracker Bot is alive and well! 🤖');
});

app.listen(port, () => {
  console.log(`🌐 Dummy Web Server listening on port ${port} (to keep Render free tier happy)`);
  console.log("🚀 Starting Automated Job Tracker...");
  startCron();
});
