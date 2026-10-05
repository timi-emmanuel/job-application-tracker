require('dotenv').config();
const { startCron } = require('./src/cron/index');

console.log("🚀 Starting Automated Job Tracker...");
startCron();
