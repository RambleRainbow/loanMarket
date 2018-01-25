"use strict";

var express = require('express');
var router = express.Router();
var channels = require('../domain/channels');

/* GET home page. */
router.get('/', function (req, res, next) {
  (async() => {
    let rtn = await channels.readAll();
    if(rtn.errorCode === 0) {
      res.json(rtn.data);
    }
    else {
      res.statusCode = 500;
      res.json({
        msg: rtn.msg
      });
    }
  })();
});

router.get('/:id', function(req, res,next) {
  (async() => {
    let rtn = channels.readAll()
  })();
});

module.exports = router;
