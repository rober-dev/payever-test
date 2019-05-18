// Vendor libs
const express = require('express');
const app = express();
const bodyParsre = require('body-parser');
const axios = require('axios');
const Fs = require('fs');
const Path = require('path');
const base64 = require('node-base64-image');

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
  var img = new Buffer(path, 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/jpg',
    'Content-Length': img.length
  });
  res.end(img);
});

app.get('/scrap', async (req, res) => {
  let url = 'https://reqres.in/api/users?page=';
  const jsonPath = Path.resolve(__dirname, 'users.json');

  const fileExists = Fs.existsSync(jsonPath);
  if (!fileExists) {
    const initialData = { page: 0, data: [] };
    Fs.writeFileSync(jsonPath, JSON.stringify(initialData));
  }

  const jsonData = readJsonFileSync(jsonPath);
  const currentPage = jsonData.page + 1;

  const newData = await axios.get(url + currentPage);
  if (newData) {
    newData.data.data.map(item => {
      jsonData.data.push(item);
    });
  }
  jsonData.page = currentPage;

  var jsonDataStr = JSON.stringify(jsonData);
  Fs.writeFileSync(jsonPath, jsonDataStr);

  res.json('done');
});

// Start server
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

function readJsonFileSync(filepath, encoding) {
  if (typeof encoding == 'undefined') {
    encoding = 'utf8';
  }
  var file = Fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}
