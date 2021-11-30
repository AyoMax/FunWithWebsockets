const express    = require('express');
const path       = require('path');
const Proxy      = require('http-proxy').createProxyServer();
const config     = require(path.join(__dirname,"../../global.json"));
const port       = config.Server.settings.port;
const app        = express();

const ProxyServer= 'https://fun-websockets.herokuapp.com:'+ config.Proxy.settings.port;
// const ProxyServer= 'http://localhost:'+ config.Proxy.settings.port;

/**
 * WebSocket Configuration
 */
const io = require('socket.io')(config.Server.settings.socket, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    },
    path: '/',
    serveClient: true,
    origins: '*:*',
    cookie: true,
    pingInterval: 1000,
    pingTimeout: 1000,
    upgradeTimeout: 1000,
    allowUpgrades: true,
    cookie: 'ayomax_stream',
    cookiePath:'/',
    cookieHttpOnly:true
});

io.on('connection',function(socket){
    socket.on('stream',function(data){
        socket.broadcast.emit('stream',data);
    });
});

io.of('/stream').clients((error, clients) => {
    if (error) throw error;
    console.log(clients);
});

/**
 * Run Proxy Server
 */
app.all("/*", function(req, res) {
    Proxy.web(req, res, {target: ProxyServer});
});

app.listen(port, () => console.log(`Listen to port : `+port));