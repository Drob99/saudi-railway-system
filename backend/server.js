const app = require('./app'); // Import the Express app
require('dotenv').config(); // Load environment variables

const port = process.env.PORT || 3000; // Use port from .env or default to 3000

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
