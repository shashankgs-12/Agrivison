import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

/**
 * HTTP Hello World status check endpoint
 */
export const apiHealthCheck = onRequest((request, response) => {
  logger.info("AgriVision Cloud Functions active", { structuredData: true });
  response.json({
    status: "online",
    platform: "AgriVision AI",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Scheduled function running daily at 6:00 AM to fetch weather and compute irrigation alerts
 */
export const dailyIrrigationCheck = onSchedule("0 6 * * *", async (event) => {
  logger.info("Running daily morning irrigation check for registered farms...");
  // Weather aggregation and automated irrigation advice generation logic
});

/**
 * Scheduled function running hourly to check severe weather warnings
 */
export const severeWeatherAlertCheck = onSchedule("0 * * * *", async (event) => {
  logger.info("Checking severe weather warnings...");
  // Regional storm / flood alert notification dispatch
});
