const pool = require("../db");
const sendEmail = require("./send_email"); // Import your sendEmail function

const sendUnpaidReminders = async () => {
  try {
    // Query unpaid bookings
    const query = `
      SELECT 
        p.Email, 
        b.BookingID, 
        t.Name_English AS TrainName, 
        b.Date, 
        b.BaseFare 
      FROM Booking b
      JOIN Passenger pa ON pa.PersonID = b.PassengerID
      JOIN Person p ON p.PersonID = pa.PersonID
      JOIN Train t ON t.TrainID = b.TrainID
      WHERE b.Status = 'Waiting';
    `;
    const result = await pool.query(query);

    if (result.rowCount === 0) {
      console.log("No unpaid bookings found.");
      return;
    }

    // Send email reminders
    for (const row of result.rows) {
      const emailData = {
        to: row.email,
        subject: `Payment Reminder for Your Train Booking`,
        text: `Dear Passenger,

We noticed that you haven't completed the payment for your train booking:
- Train: ${row.trainname}
- Date: ${row.date}
- Booking ID: ${row.bookingid}
- Amount Due: $${row.basefare}

Please complete your payment as soon as possible to confirm your seat.

Thank you,
Railway System`,
        html: `<p>Dear Passenger,</p>
               <p>We noticed that you haven't completed the payment for your train booking:</p>
               <ul>
                 <li><b>Train:</b> ${row.trainname}</li>
                 <li><b>Date:</b> ${row.date}</li>
                 <li><b>Booking ID:</b> ${row.bookingid}</li>
                 <li><b>Amount Due:</b> $${row.basefare}</li>
               </ul>
               <p>Please complete your payment as soon as possible to confirm your seat.</p>
               <p>Thank you,<br>Railway System</p>`,
      };

      try {
        await sendEmail(emailData);
        console.log(`Reminder sent to: ${row.email}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${row.email}:`, emailError);
      }
    }
  } catch (error) {
    console.error("Error sending unpaid reminders:", error);
  }
};

module.exports = { sendUnpaidReminders };
