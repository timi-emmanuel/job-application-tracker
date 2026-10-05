require('dotenv').config();
const { runJobTrackerPipeline } = require('./src/cron/index');

console.log("Testing the full end-to-end pipeline once...");
runJobTrackerPipeline();
