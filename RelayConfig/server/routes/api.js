var express = require('express');
var router = express.Router();
var net = require('net');

router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', (req, res) => {
    res.send('Server is running')
})

var client = new net.Socket();

router.post('/connect', (req, res) => {
    var data = req.body
    console.log(data)

    let retStatus = 500;
    client.connect(data.port, data.ipaddress, function () {
        console.log('Connected');
        retStatus = client.closed ? 500 : 200;
        res.status(retStatus).send();
    });
})

router.post('/disconnect', (req, res) => {
    let retStatus = 500;
    if (!client.closed) {
        client.end();
        console.log('Disconnected');
        retStatus = 200;
    }
    res.status(retStatus).send();
})

router.post('/relayconfig', (req, res) => {
    console.log(req.body)
    var data = req.body
    let retStatus = 500;
    if (!client.closed) {
        var dataBuffer = new Buffer.from(JSON.stringify(data));
        console.log('Data: ' + dataBuffer);
        client.write(dataBuffer);
        retStatus = 200;
    }
    res.status(retStatus).send();
})


module.exports = router;
