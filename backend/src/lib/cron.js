/**
 * @file cron.js
 * @description Background cron utility designed to prevent the Render free tier 
 * from spinning down by issuing automated keep-alive polling requests.
 */

import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function () {
    // 1. Automated Handshake Dispatch
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

export default job;

// CRON JOB EXPLANATION:
// Cron jobs are scheduled tasks that run periodically at fixed intervals
// we want to send 1 GET request for every 14 minutes

// How to define a "Schedule"?
// You define a schedule using a cron expression, which consists of 5 fields representing:

//! MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK

// CRON SCHEDULE REFERENCE EXAMPLES //
// */14 * * * *    - Executed repeatedly every 14 minutes
// * 0 * * * *     - Executed at the top of every hour
// * 0 0 * * 0     - Executed precisely at midnight every Sunday
// * 30 3 15 * *   - Executed at 3:30 AM on the 15th of each calendar month
// * 0 0 1 1 *     - Executed at midnight on January 1st
