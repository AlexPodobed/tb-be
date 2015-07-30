/**
 * Main application file
 */

'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var socketio = require('socket.io');

mongoose.connect(config.mongo.uri, config.mongo.options);

var app = express();
var server = require('http').createServer(app);
var io = socketio(80);


require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});



var Controller = require("./controller");
var autoBuildCtrl = {};
var buildHash = {};



io.on('connection', function (socket) {
	// send message to all connected people
  io.emit('this', { will: 'be received by everyone'});



// get building list accroding to village id
  socket.on('get-queue-list', function  (data) {
  	var currentVillage = buildHash[data.villageId];

  	socket.emit('get-queue-list', {
  		buildList: (currentVillage) ? currentVillage.buildQueue : [],
  		isLoop: (currentVillage) ? currentVillage.isLoop : false
  	});
  });

// add build details obj to buildHash accordingly to the village id
  socket.on('add-to-queue', function  (data) {
  	Controller.addToQueue(data, buildHash);
  });
// remove build from the queue
  socket.on('remove-from-queue', function  (data) {
  	Controller.removeFromQueue(data, buildHash);
  });

  socket.on('trigger-auto-building', function  (data) {
  	Controller.triggerAutoBuilding(autoBuildCtrl, data, buildHash, {io: io, socket: socket});
  });

// get build hash - for testing
  socket.on('get-info', function  () {
  	socket.emit('get-info', {
  		autoBuildCtrl: autoBuildCtrl,
  		buildHash: buildHash
  	});
  });


  socket.on('disconnect', function () {
    io.emit('user disconnected');
  });
});

// Expose app
module.exports = app;