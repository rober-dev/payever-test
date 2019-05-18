// Vendor libs
const express = require('express');
const app = express();
const bodyParsre = require('body-parser');
const axios = require('axios');
const Fs = require('fs');
const Path = require('path');
const base64 = require('node-base64-image');
const base64Img = require('base64-img');

// Load environment settings
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// Custom libs
app.get('/', (req, res) => {
  res.json('hi');
});

app.get('/api/user/:id', async (req, res) => {
  const param = req.params.id;
  const url = `https://reqres.in/api/users/${param}`;
  const response = await axios.get(url);
  res.json(response.data.data);
});

app.delete('/api/user/:id/avatar', async (req, res) => {
  const param = req.params.id;
  const path = Path.resolve(__dirname, 'images', param + '.jpg');
  const fileExists = await Fs.existsSync(path);
  if (fileExists) {
    try {
      Fs.unlinkSync(path);
      res.json('File deleted');
    } catch (err) {
      res.send(err);
    }
  } else {
    res.json('File does not exists');
  }
});

app.get('/api/user/:id/avatar', async (req, res) => {
  const param = req.params.id;
  const url = `https://reqres.in/api/users/${param}`;
  const response = await axios.get(url);

  const avatarUrl = response.data.data.avatar;
  const path = Path.resolve(__dirname, 'images', param + '.jpg');

  // Search file
  const fileExists = await Fs.existsSync(path);
  if (!fileExists) {
    const writer = Fs.createWriteStream(path);

    const responseImg = await axios({
      url: avatarUrl,
      method: 'GET',
      responseType: 'stream'
    });

    responseImg.data.pipe(writer);
  }

  // Response image from disk
  const data = base64Img.base64Sync(path);
  res.send(data);
});

// Start server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
