var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(process.env.PORT || 3000);

app.use(express.static('public'));
console.log("Server running on port 3000");


let alreadyConnect = {};
var io = socket(server);
io.sockets.on('connection', socket => {
    console.log('New connection : ' + socket.id);

    socket.emit('connection', {
        id: socket.id,
        alreadyConnect: JSON.stringify(alreadyConnect)
    });
    socket.broadcast.emit('someoneConnect', {id: socket.id});

    socket.on('query', data => {
        socket.broadcast.emit('query', data);
        socket.to(data.to).emit('query', data);
    })

    socket.on('disconnect', (reason) => {
        console.log('Disconnection : ' + socket.id);
        socket.broadcast.emit('someoneDisconnect', {id: socket.id});
        delete alreadyConnect[socket.id];
    })

    alreadyConnect[socket.id] = {id: socket.id};
});