const net = require('net');
const port = 7070;
const host = '127.0.0.1';

const server = net.createServer();
server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port + '.');
});

let sockets = [];

server.on('connection', function (sock) {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    sockets.push(sock);

    sock.on('data', function (dataBuffer) {
        console.log('DATA ' + sock.remoteAddress + ': ' + dataBuffer);
        var relayConfig = JSON.parse(dataBuffer.toString());
        console.log(relayConfig)
    });

    sock.on('close', function (data) {
        let index = sockets.findIndex(function (eachSocket) {
            return eachSocket.remoteAddress === sock.remoteAddress &&
                eachSocket.remotePort === sock.remotePort;
        })

        if (index !== -1) sockets.splice(index, 1);
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
});