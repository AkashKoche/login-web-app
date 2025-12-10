const express = require('express');
const bodyParser = require('body-parser'); // For handling JSON bodies
const linkRoutes = require('./routes'); // The modified routes above
require('./database'); // Ensure database pool is initialized

const app = express();
const PORT = 3001; // Assign a new port for the service

app.use(bodyParser.json());

// Base route for the link service
app.use('/api/v1/links', linkRoutes);

app.listen(PORT, () => {
    console.log(`Link Service is running on port ${PORT}`);
});
