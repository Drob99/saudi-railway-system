const generateTicketEmailTemplate = (bookings, passengers) => {
  const createTicketHtml = (booking, passenger) => `
    <div style="
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 32px;
      background-color: #ffffff;
      font-family: Arial, sans-serif;
    ">
      <!-- Header -->
      <div style="
        border-bottom: 2px solid #1f2937;
        padding-bottom: 16px;
        margin-bottom: 24px;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h1 style="
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          ">Railway Ticket</h1>
          <div style="text-align: right;">
            <p style="
              font-size: 14px;
              color: #4b5563;
              margin: 0;
            ">Booking ID:</p>
            <p style="
              font-weight: bold;
              margin: 0;
            ">#${booking.bookingid}</p>
          </div>
        </div>
      </div>

      <!-- Passenger Information -->
      <div style="margin-bottom: 24px;">
        <h2 style="
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
        ">Passenger Details</h2>
        <div style="
          background-color: #f9fafb;
          padding: 16px;
          border-radius: 4px;
        ">
          <p style="
            font-weight: 500;
            margin: 0 0 4px 0;
          ">${passenger.name??`${passenger.fname} ${passenger.minit} ${passenger.lname}`}</p>
          <p style="
            color: #4b5563;
            margin: 0;
          ">Type: ${
            passenger.type === "dependent"
              ? `Dependent (${passenger.relation})`
              : "Primary"
          }</p>
        </div>
      </div>

      <!-- Journey Details Grid -->
      <div style="
        display: inline-block;
        width: 100%;
        margin-bottom: 24px;
      ">
        <!-- Journey Details Column -->
        <div style="
          width: 48%;
          float: left;
          margin-right: 2%;
        ">
          <h2 style="
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
          ">Journey Details</h2>
          <div style="margin-bottom: 8px;">
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            ">
              <span style="color: #4b5563;">Date:</span>
              <span>${new Date(booking.tripDate).toLocaleDateString()}</span>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            ">
              <span style="color: #4b5563;">Class:</span>
              <span>${booking.class}</span>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            ">
              <span style="color: #4b5563;">Seat Number:</span>
              <span style="font-weight: bold;">${booking.seatnumber}</span>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            ">
              <span style="color: #4b5563;">Luggage:</span>
              <span>${booking.numofluggage} piece(s)</span>
            </div>
          </div>
        </div>

        <!-- Trip Information Column -->
        <div style="
          width: 48%;
          float: left;
          margin-left: 2%;
        ">
          <h2 style="
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
          ">Trip Information</h2>
          <div style="margin-bottom: 8px;">
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            ">
              <span style="color: #4b5563;">Trip ID:</span>
              <span>${booking.tripid}</span>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            ">
              <span style="color: #4b5563;">Train:</span>
              <span>${booking.trainid}</span>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            ">
              <span style="color: #4b5563;">Track:</span>
              <span>${booking.trackid}</span>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            ">
              <span style="color: #4b5563;">Fare:</span>
              <span>$${booking.basefare}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="
        border-top: 2px solid #e5e7eb;
        padding-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        clear: both;
      ">
        <div style="
          font-size: 14px;
          color: #4b5563;
        ">
          <p style="margin: 0;">Please present this ticket when boarding</p>
          <p style="margin: 4px 0 0 0;">Keep this ticket safe and accessible during your journey</p>
        </div>
        <div style="
          width: 96px;
          height: 96px;
          background-color: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            font-size: 12px;
            color: #4b5563;
          ">QR Code</span>
        </div>
      </div>
    </div>
  `;

  // Generate HTML for all tickets
  const allTicketsHtml = bookings
    .map((booking, index) => createTicketHtml(booking, passengers[index]))
    .join('<div style="page-break-after: always;"></div>');

  // Wrap with email template
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Railway Tickets</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        background-color: #f3f4f6;
      ">
        ${allTicketsHtml}
      </body>
    </html>
  `;
};

export default generateTicketEmailTemplate;