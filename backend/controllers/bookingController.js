const pool = require("../db");
const sendEmail = require("../utils/send_email");
const {
  default: generateTicketEmailTemplate,
} = require("../utils/ticket_html_email");

const createBookingForPassenger = async (req, res) => {
  const {
    class: bookingClass,
    dependents,
    seatNumbers,
    tripId,
    passengerId,
    numOfLuggage = 0,
  } = req.body;

  if (
    !bookingClass ||
    !seatNumbers ||
    !tripId ||
    !passengerId ||
    seatNumbers.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Required fields are missing: class, seatNumbers, tripId, passengerId.",
    });
  }

  const baseFare =
    bookingClass === "Economy" ? 50 : bookingClass === "Business" ? 75 : null;

  if (baseFare === null) {
    return res.status(400).json({
      success: false,
      message: "Invalid class. Allowed values are 'Economy' or 'Business'.",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Start transaction

    // Fetch train and trip details
    const tripQuery = `
      SELECT TrainID, TrackID, OriginStationID, DestinationStationID
      FROM Trip
      WHERE TripID = $1;
    `;
    const tripResult = await client.query(tripQuery, [tripId]);

    if (tripResult.rowCount === 0) {
      throw new Error(
        "Invalid trip ID. No associated train or stations found."
      );
    }

    const {
      trainid: trainId,
      trackid: trackId,
      originstationid: originStationId,
      destinationstationid: destinationStationId,
    } = tripResult.rows[0];

    // Check overall seat availability for the class
    const availabilityQuery = `
      SELECT 
        CASE 
          WHEN $1 = 'Economy' THEN t.Capacity_Economy - COUNT(b.SeatNumber)
          WHEN $1 = 'Business' THEN t.Capacity_Business - COUNT(b.SeatNumber)
          ELSE 0
        END AS AvailableSeats
      FROM Train t
      LEFT JOIN Booking b ON b.TrainID = t.TrainID AND b.Class = $1 AND b.Status = 'Confirmed'
      WHERE t.TrainID = $2
      GROUP BY t.Capacity_Economy, t.Capacity_Business;
    `;
    const availabilityResult = await client.query(availabilityQuery, [
      bookingClass,
      trainId,
    ]);
    const availableSeats = availabilityResult.rows[0]?.availableseats || 0;

    if (availableSeats < seatNumbers.length) {
      throw new Error(`Not enough available seats in ${bookingClass} class.`);
    }

    let totalCost = 0;
    let passengerBookingId;

    // Validate and insert each seat
    for (let i = 0; i < seatNumbers.length; i++) {
      const seatNumber = seatNumbers[i];
      const dependentId = dependents?.[i] || null;

      // Check if the seat is already booked
      const seatCheckQuery = `
        SELECT BookingID 
        FROM Booking 
        WHERE SeatNumber = $1 AND TripID = $2 AND TrainID = $3;
      `;
      const seatCheckResult = await client.query(seatCheckQuery, [
        seatNumber,
        tripId,
        trainId,
      ]);

      if (seatCheckResult.rowCount > 0) {
        throw new Error(`Seat ${seatNumber} is already booked.`);
      }

      // Insert booking
      const bookingQuery = `
        INSERT INTO Booking (Class, Status, Date, BaseFare, NumOfLuggage, SeatNumber, TripID, TrainID, TrackID, OriginStationID, DestinationStationID, PassengerID, DependentID)
        VALUES ($1, 'Waiting', CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING BookingID;
      `;
      const bookingResult = await client.query(bookingQuery, [
        bookingClass,
        baseFare,
        numOfLuggage,
        seatNumber,
        tripId,
        trainId,
        trackId,
        originStationId,
        destinationStationId,
        passengerId,
        dependentId,
      ]);

      // Store the passenger's booking ID for the payment
      if (!dependentId) {
        passengerBookingId = bookingResult.rows[0].bookingid;
      }

      // Accumulate total cost
      totalCost += baseFare;
    }

    if (!passengerBookingId) {
      throw new Error(
        "Passenger booking ID could not be determined. Please try again."
      );
    }

    // Insert a payment record for the total cost, linked to the passenger's booking ID
    const paymentQuery = `
      INSERT INTO Payment (Amount, Status, PaymentDate, BookingID)
      VALUES ($1, 'Pending', CURRENT_DATE, $2)
      RETURNING PaymentID;
    `;
    const paymentResult = await client.query(paymentQuery, [
      totalCost,
      passengerBookingId,
    ]);

    await client.query("COMMIT"); // Commit transaction

    res.status(201).json({
      success: true,
      message: "Booking created successfully for passenger and dependents.",
      paymentId: paymentResult.rows[0].paymentid,
      totalCost,
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaction in case of error
    console.error("Error creating booking for passenger:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  } finally {
    client.release();
  }
};

const createReservationForStaff = async (req, res) => {
  const {
    class: bookingClass,
    dependents,
    seatNumbers,
    tripId,
    passengerId,
    status,
    numOfLuggage = 0,
  } = req.body;

  if (
    !bookingClass ||
    !seatNumbers ||
    !tripId ||
    !passengerId ||
    !status ||
    seatNumbers.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Required fields are missing: class, seatNumbers, tripId, passengerId, status.",
    });
  }

  const validStatuses = ["Confirmed", "Waiting"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Allowed values are 'Confirmed' or 'Waiting'.",
    });
  }

  const baseFare =
    bookingClass === "Economy" ? 50 : bookingClass === "Business" ? 75 : null;

  if (baseFare === null) {
    return res.status(400).json({
      success: false,
      message: "Invalid class. Allowed values are 'Economy' or 'Business'.",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tripQuery = `
      SELECT TrainID, TrackID, OriginStationID, DestinationStationID
      FROM Trip
      WHERE TripID = $1;
    `;
    const tripResult = await client.query(tripQuery, [tripId]);
    if (tripResult.rowCount === 0) {
      throw new Error(
        "Invalid trip ID. No associated train or stations found."
      );
    }

    const {
      trainid: trainId,
      trackid: trackId,
      originstationid: originStationId,
      destinationstationid: destinationStationId,
    } = tripResult.rows[0];

    const availabilityQuery = `
      SELECT 
        CASE 
          WHEN $1 = 'Economy' THEN t.Capacity_Economy - COUNT(b.SeatNumber)
          WHEN $1 = 'Business' THEN t.Capacity_Business - COUNT(b.SeatNumber)
          ELSE 0
        END AS AvailableSeats
      FROM Train t
      LEFT JOIN Booking b ON b.TrainID = t.TrainID AND b.Class = $1 AND b.Status = 'Confirmed'
      WHERE t.TrainID = $2
      GROUP BY t.Capacity_Economy, t.Capacity_Business;
    `;
    const availabilityResult = await client.query(availabilityQuery, [
      bookingClass,
      trainId,
    ]);
    const availableSeats = availabilityResult.rows[0]?.availableseats || 0;

    if (availableSeats < seatNumbers.length) {
      throw new Error(`Not enough available seats in ${bookingClass} class.`);
    }

    let totalCost = 0;
    const bookedSeats = [];
    const _allBookings = [];

    for (let i = 0; i < seatNumbers.length; i++) {
      const seatNumber = seatNumbers[i];
      const dependentId = dependents?.[i] || null;

      const seatCheckQuery = `
        SELECT BookingID 
        FROM Booking 
        WHERE SeatNumber = $1 AND TripID = $2 AND TrainID = $3 AND Status = 'Confirmed';
      `;
      const seatCheckResult = await client.query(seatCheckQuery, [
        seatNumber,
        tripId,
        trainId,
      ]);

      if (seatCheckResult.rowCount > 0) {
        throw new Error(`Seat ${seatNumber} is already booked.`);
      }

      const bookingQuery = `
        INSERT INTO Booking (Class, Status, Date, BaseFare, NumOfLuggage, SeatNumber, TripID, TrainID, TrackID, OriginStationID, DestinationStationID, PassengerID, DependentID)
        VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING BookingID;
      `;
      const bookingResult = await client.query(bookingQuery, [
        bookingClass,
        status,
        baseFare,
        numOfLuggage,
        seatNumber,
        tripId,
        trainId,
        trackId,
        originStationId,
        destinationStationId,
        passengerId,
        dependentId,
      ]);

      _allBookings.push(bookingResult.rows[0]);
      bookedSeats.push({
        bookingId: bookingResult.rows[0].bookingid,
        seatNumber,
      });
      totalCost += baseFare;
    }

    // Insert payment record
    const paymentStatus = status === "Confirmed" ? "Completed" : "Pending";
    const paymentQuery = `
      INSERT INTO Payment (Amount, Status, PaymentDate, BookingID)
      VALUES ($1, $2, CURRENT_DATE, $3);
    `;
    for (const booking of bookedSeats) {
      await client.query(paymentQuery, [
        baseFare,
        paymentStatus,
        booking.bookingId,
      ]);
    }

    // Fetch passenger details
    const passengerQuery = `
      SELECT p.PersonID, p.FName, p.LName, p.Email
      FROM Passenger pa
      JOIN Person p ON pa.PersonID = p.PersonID
      WHERE pa.PersonID = $1;
    `;
    const passengerResult = await client.query(passengerQuery, [passengerId]);

    if (passengerResult.rowCount === 0) {
      throw new Error("Passenger not found.");
    }

    const passenger = passengerResult.rows[0];

    // Send confirmation email based on status
    const emailSubject =
      status === "Confirmed" ? "Reservation Confirmed" : "Reservation Waiting";
    const emailMessage =
      status === "Confirmed"
        ? `<p>Your reservation has been successfully confirmed.</p>`
        : `<p>Complete the payment <a href="https://google.com?q=how+to+be+smart">here</a></p>`;

    if (status === "Confirmed") {
      await sendEmail({
        subject: "Tickets",
        to: ["o@i3mr.com", "drob992004@gmail.com", passenger.email],
        html: generateTicketEmailTemplate(_allBookings, [
          passenger,
          ...dependents,
        ]),
      });
    } else {
      await sendEmail({
        subject: emailSubject,
        to: passenger.email,
        html: `
        <p>Dear ${passenger.fname} ${passenger.lname},</p>
        ${emailMessage}
        <p>Seats: ${bookedSeats.map((seat) => seat.seatNumber).join(", ")}</p>
        <p>Total Cost: $${totalCost}</p>
        <p>Thank you for choosing our service.</p>
      `,
      });
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message:
        "Reservation and payment created successfully for passenger and dependents.",
      totalCost,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating reservation for staff:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  } finally {
    client.release();
  }
};


const updateBooking = async (req, res) => {
  const { bookingId } = req.params;
  const {
    class: bookingClass,
    seatNumber,
    baseFare,
    numOfLuggage,
    dependentId,
  } = req.body;

  try {
    const statusCheckQuery = `
      SELECT Status
      FROM Booking
      WHERE BookingID = $1;
    `;
    const statusCheckResult = await pool.query(statusCheckQuery, [bookingId]);

    if (statusCheckResult.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }

    if (["Cancelled", "Confirmed"].includes(statusCheckResult.rows[0].status)) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot update a booking that is already Confirmed or Cancelled.",
      });
    }

    const query = `
      UPDATE Booking
      SET Class = $1, SeatNumber = $2, BaseFare = $3, NumOfLuggage = $4, DependentID = $5
      WHERE BookingID = $6
      RETURNING *;
    `;
    const values = [
      bookingClass,
      seatNumber,
      baseFare,
      numOfLuggage,
      dependentId,
      bookingId,
    ];

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: "Booking updated successfully.",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating booking:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cancel a booking.
 */
const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const statusCheckQuery = `
      SELECT Status
      FROM Booking
      WHERE BookingID = $1;
    `;
    const statusCheckResult = await pool.query(statusCheckQuery, [bookingId]);

    if (statusCheckResult.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }

    if (statusCheckResult.rows[0].status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "The booking is already cancelled.",
      });
    }

    const query = `
      UPDATE Booking
      SET Status = 'Cancelled'
      WHERE BookingID = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [bookingId]);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Error cancelling booking:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get booking details.
 */
const getBookingDetails = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const query = `
    SELECT b.*, d.Name AS DependentName
    FROM Booking b
    LEFT JOIN Dependent d ON b.DependentID = d.DepID
    WHERE b.BookingID = $1;
    `;
    const result = await pool.query(query, [bookingId]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found." });
    }

    res.status(200).json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error("Error fetching booking details:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * Complete payment for a booking.
 */
const completePayment = async (req, res) => {
  const { paymentId } = req.params;
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({
      success: false,
      message: "Amount is required.",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // Start transaction

    // Retrieve the payment details
    const paymentQuery = `
      SELECT PaymentID, BookingID, Amount, Status
      FROM Payment
      WHERE PaymentID = $1;
    `;
    const paymentResult = await client.query(paymentQuery, [paymentId]);

    if (paymentResult.rowCount === 0) {
      throw new Error("Payment not found.");
    }

    const {
      bookingid: bookingId,
      amount: totalAmount,
      status,
    } = paymentResult.rows[0];

    if (status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed for this booking.",
      });
    }

    // Validate the total payment amount
    if (amount !== parseFloat(totalAmount)) {
      return res.status(400).json({
        success: false,
        message: `Payment amount must match the total amount owed: ${totalAmount}.`,
      });
    }

    // Retrieve passenger ID and booking status
    const bookingQuery = `
      SELECT PassengerID, Status
      FROM Booking
      WHERE BookingID = $1;
    `;
    const bookingResult = await client.query(bookingQuery, [bookingId]);

    if (bookingResult.rowCount === 0) {
      throw new Error("Booking not found for this payment.");
    }

    const { passengerid: passengerId, status: bookingStatus } =
      bookingResult.rows[0];

    if (bookingStatus !== "Waiting") {
      return res.status(400).json({
        success: false,
        message:
          "Payment can only be completed for bookings with 'Waiting' status.",
      });
    }

    // Update the payment status to 'Completed'
    const updatePaymentQuery = `
      UPDATE Payment
      SET Status = 'Completed'
      WHERE PaymentID = $1;
    `;
    await client.query(updatePaymentQuery, [paymentId]);

    // Update all related bookings for the passenger to 'Confirmed' and fetch TripDate
    const updateBookingsQuery = `
      UPDATE Booking
      SET Status = 'Confirmed'
      WHERE PassengerID = $1 AND Status = 'Waiting'
      RETURNING *,
        (SELECT DepartureTime::date 
         FROM Trip 
         WHERE TripID = Booking.TripID) AS TripDate;
    `;
    const updateBookingsResult = await client.query(updateBookingsQuery, [
      passengerId,
    ]);

    // Fetch passenger information
    const passengerQuery = `
      SELECT 
        p.PersonID, 
        p.FName, 
        p.MInit, 
        p.LName, 
        p.Email, 
        p.Phone, 
        pa.IdentificationDoc, 
        pa.LoyaltyKilometers
      FROM Passenger pa
      JOIN Person p ON pa.PersonID = p.PersonID
      WHERE pa.PersonID = $1;
    `;
    const passengerResult = await client.query(passengerQuery, [passengerId]);

    if (passengerResult.rowCount === 0) {
      throw new Error("Passenger not found.");
    }

    const passenger = passengerResult.rows[0];

    // Fetch dependents information
    const dependentsQuery = `
      SELECT 
        d.DepID, 
        d.Name, 
        d.Relationship
      FROM Dependent d
      WHERE d.PersonID = $1;
    `;
    const dependentsResult = await client.query(dependentsQuery, [passengerId]);

    const dependents = dependentsResult.rows;

    // Send confirmation email
    await sendEmail({
      subject: "Tickets",
      to: ["o@i3mr.com", "drob992004@gmail.com"],
      html: generateTicketEmailTemplate(updateBookingsResult.rows, [
        passenger,
        ...dependents,
      ]),
    });

    await client.query("COMMIT"); // Commit transaction

    // Send the response after all processing is complete
    res.status(201).json({
      success: true,
      message: "Payment completed successfully, and bookings confirmed.",
      paymentId,
      bookings: updateBookingsResult.rows.map((booking) => ({
        ...booking,
        tripdate: booking.tripdate, // Include TripDate in the response
      })),
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaction in case of error
    console.error("Error completing payment:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  } finally {
    client.release();
  }
};

module.exports = {
  updateBooking,
  cancelBooking,
  getBookingDetails,
  completePayment,
  createBookingForPassenger,
  createReservationForStaff,
};
