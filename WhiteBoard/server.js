var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(3000);

app.use(express.static('public'));
console.log("Server running on port 3000");

var io = socket(server);
io.sockets.on('connection', socket => {
    console.log('New connection : ' + socket.id);

    socket.on('mouse', data => {
        data.id  = socket.id;
        socket.broadcast.emit('mouse', data);
    })
});