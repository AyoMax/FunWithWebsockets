var express = require('express');
var socket = require('socket.io');

var app = express();
var server = app.listen(process.env.PORT || 3000);

app.use(express.static('public'));
console.log("Server running on port 3000");


let alreadyConnect = {};
let connections = [];

var io = socket(server);
io.sockets.on('connection', socket => {
    console.log('New connection : ' + socket.id);

    socket.emit('connection', {
        id: socket.id,
        alreadyConnect: JSON.stringify(alreadyConnect)
    });
    socket.broadcast.emit('someoneConnect', {id: socket.id});

    socket.on('disconnect', (reason) => {
        console.log('Disconnection : ' + socket.id);
        // On prévient tout le monde qu'une personne c'est déconnecté
        socket.broadcast.emit('someoneDisconnect', {id: socket.id});

        // On met à jour la liste des sockets connectées
        delete alreadyConnect[socket.id];

        // On met à jour la liste des connexions en supprimant les connexions lié à l'id de la socket courante
        const otherId = connections[socket.id];
        if (otherId) {
            delete connections[socket.id];
            delete connections[otherId];

            socket.to(otherId).emit('quitOther');
        }
    });

    socket.on('joinOther', (data) => {
        // On crée la connection entre les deux utilisateurs
        connections[socket.id] = data.other.id;
        connections[data.other.id] = socket.id;

        // On met à jour leur description pour les nouveaux arrivant dans le canal
        alreadyConnect[socket.id].reachable = false;
        alreadyConnect[data.other.id].reachable = false;

        // On prévient tout le monde qu'il ne peuvent plus conversé avec les utilisateurs qui sont en communication
        socket.broadcast.emit('unreachable', {
            unreachable: [
                alreadyConnect[socket.id],
                alreadyConnect[data.other.id]
            ]
        });

        // On prévient l'autre qu'un partenaire l'a rejoint
        socket.to(data.other.id).emit('joinOther', {
            other: {
                id: socket.id
            }
        });

        // On confirme la connexion à un autre utilisateur
        socket.emit('joinOther', data);
    });

    socket.on('quitOther', () => {
        let otherId = connections[socket.id];

        // On supprime la connection entre les deux utilisateurs
        delete connections[otherId];
        delete connections[socket.id];

        // On met à jour leur description pour les nouveaux arrivant dans le canal
        alreadyConnect[socket.id].reachable = true;
        alreadyConnect[otherId].reachable = true;

        // On confirme la déconnexion à un autre utilisateur
        socket.emit('quitOther');

        // On prévient l'autre que son partenaire l'a quitté
        socket.to(otherId).emit('quitOther');

        // On prévient tout le monde qu'ils ne peuvent plus converser avec les utilisateurs qui sont en communication
        socket.broadcast.emit('reachable', {
            reachable: [
                alreadyConnect[socket.id],
                alreadyConnect[otherId]
            ]
        });
    });

    socket.on('query', (data) => {
        // socket.broadcast.emit('query', data);
        if (connections[socket.id]) {
            socket.to(connections[socket.id]).emit('query', data);
        }
    });

    alreadyConnect[socket.id] = {
        id: socket.id,
        reachable: true
    };
});