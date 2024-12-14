const app = require("./app"); // Import the Express app

require("dotenv").config(); // Load environment variables

// Validate required environment variables
if (!process.env.PORT || !process.env.EMAIL_USER || !process.env.APP_PASSWORD) {
  console.error("Error: Missing required environment variables");
  process.exit(1); // Exit with failure code
}

const port = process.env.PORT || 3000; // Use port from .env or default to 3000

// Start the server
const server = app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown handling
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Closing server gracefully...`);
  server.close(() => {
    console.log("Server closed. Exiting process...");
    process.exit(0); // Exit with success code
  });
};

// Listen for termination signals
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Catch unhandled exceptions and rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1); // Exit with failure code
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
