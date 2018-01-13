"use strict";
let express = require('express');
let router = express.Router();
let svgCaptcha = require('svg-captcha');
let moment = require('moment');
let crypto = require('crypto');

var allCaptchas = {};
var sha = crypto.createHash('SHA256');

router.post('/', function(req, res, next) {
    let captcha = svgCaptcha.create();
    //req.cookies.captcha = captcha.text;

    let result = {
        expire: moment().add(5,'m').format('YYYY-MM-DD HH:mm:ss'),
        text: captcha.text
    };

    let hashid = sha.update(JSON.stringify(result) + captcha.data).digest('hex');
    allCaptchas[hashid] = result;

    res.json({
        id: hashid,
        captcha: 'data/image/svg+xml;base64,' + new Buffer(captcha.data).toString('base64')
    })
});

module.exports = router;