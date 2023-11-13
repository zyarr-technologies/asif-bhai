var express = require('express');
var router = express.Router();

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', (req, res) => {
    res.send('Server is running')
})

router.post('/connect', (req, res) => {
    console.log(req.body)
    res.status(200).send();

})

router.post('/relayconfig', (req, res) => {
    console.log(req.body)
    res.status(200).send();
})


module.exports = router;
