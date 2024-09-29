var express = require('express');
var util = require('../config/util.js');
var router = express.Router();
// const llgService = require('../config/llgService.js')();

router.get('/', function(req, res) {
    res.render('partials/play', {
        title: 'Chess Hub - Game',
        user: req.user,
        isPlayPage: true
    });
});

router.post('/', function(req, res) {
    var side = req.body.side;
    //var opponent = req.body.opponent; // playing against the machine in not implemented
    var token = util.randomString(20);
    res.redirect('/game/' + token + '/' + side);
});


router.get('/balance', async (req, res) => {
    const { address } = req.query;
    const balance = await llgService.getBalance(address);

    res.status(200).send({
        ...balance
    })
})

router.post('/transfer', async (req, res) => {
    if (req.user == null || req.user == undefined) {
        return res.status(401).send({
            message: 'Unauthorized'
        })
    }

    const { to, amount } = req.body;
    
    const result = await llgService.transfer(to, amount);
    
    res.status(200).send({
        ...result
    })
})

module.exports = router;