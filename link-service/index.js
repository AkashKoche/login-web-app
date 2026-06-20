const express = require('express');
const bodyParser = require('body-parser'); // For handling JSON bodies
const linkRoutes = require('./routes'); // The modified routes above
const pool = require('./database'); // Import the database pool

const app = express();
const PORT = 3001; // Assign a new port for the service

app.use(bodyParser.json());

// Base route for the link service
app.use('/api/v1/links', linkRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.status(200).json({
      service: 'link-service',
      status: 'UP'
    });

  } catch (err) {
    res.status(500).json({
      service: 'link-service',
      status: 'DOWN'
    });
  }
});

app.listen(PORT, () => {
    console.log(`Link Service is running on port ${PORT}`);
});
