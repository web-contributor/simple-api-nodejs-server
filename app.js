var express = require('express');
var app = express();
global.__root   = __dirname + '/'; 

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var ImmoTestController = require(__root + 'immo-test');
app.use('/api/immo', ImmoTestController);

app.all('*', function (req, res) {
  res.send("Server working well!");
});

module.exports = app;