const cron = require('node-cron');
const axios = require('axios');
const Fs = require('fs');
const Path = require('path');

cron.schedule('1 * * * *', async () => {
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

function readJsonFileSync(filepath, encoding) {
  if (typeof encoding == 'undefined') {
    encoding = 'utf8';
  }
  var file = Fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}
