const schedule = require("node-schedule");
const { sendUnpaidReminders } = require("./your-reminder-file");

// Schedule to run every day at 9:00 AM
// schedule.scheduleJob("0 9 * * *", () => {
//   console.log("Running unpaid reminders job...");
//   sendUnpaidReminders();
// });
