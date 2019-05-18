// Vendor libs
const express = require('express');
const app = express();
const bodyParsre = require('body-parser');

// Load environment settings
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// Custom libs
app.get('/', (req, res) => {
  res.json('hi');
});

app.get('/api/user/:id', (req, res) => {
  const param = req.params.id;
  res.json(param);
});

// Start server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
