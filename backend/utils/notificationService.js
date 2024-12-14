const pool = require("../db");
const sendEmail = require("./emailService"); // Import the sendEmail function

/**
 * Process notifications for passengers whose train departs in 3 hours.
 */
const processNotifications = async () => {
  try {
    // Fetch notifications due for sending
    const query = `
      SELECT 
        nq.QueueID,
        nq.Email,
        nq.BookingID,
        t.Name_English AS TrainName,
        tr.DepartureTime
      FROM NotificationQueue nq
      JOIN Booking b ON b.BookingID = nq.BookingID
      JOIN Train t ON t.TrainID = b.TrainID
      JOIN Trip tr ON tr.TripID = b.TripID
      WHERE nq.NotificationTime <= NOW();
    `;
    const result = await pool.query(query);

    if (result.rowCount === 0) {
      console.log("No notifications to process.");
      return;
    }

    for (const row of result.rows) {
      const emailData = {
        to: row.email,
        subject: `Reminder: Train Departure in 3 Hours`,
        text: `Dear Passenger,

Your train (${row.trainname}) is departing in 3 hours.
Please ensure you arrive at the station on time.

Thank you,
Railway System`,
        html: `<p>Dear Passenger,</p>
               <p>Your train (<b>${row.trainname}</b>) is departing in 3 hours.</p>
               <p>Please ensure you arrive at the station on time.</p>
               <p>Thank you,<br>Railway System</p>`,
      };

      try {
        // Send notification email
        await sendEmail(emailData);
        console.log(`Notification sent to: ${row.email}`);
      } catch (emailError) {
        console.error(
          `Failed to send notification to ${row.email}:`,
          emailError
        );
      }

      // Remove the processed notification from the queue
      await pool.query("DELETE FROM NotificationQueue WHERE QueueID = $1", [
        row.queueid,
      ]);
    }
  } catch (error) {
    console.error("Error processing notifications:", error);
  }
};

module.exports = { processNotifications };
