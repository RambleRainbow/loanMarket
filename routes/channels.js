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

router.patch('/:id', function(req, res,next) {
  (async() => {
    console.log(req.body);
    let rtn = await channels.updateIsOpen({id: Number.parseInt(req.params.id), isOpen: req.body.isOpen});

    res.statusCode = 200;

    switch (rtn.errorCode) {
      case channels.ERROR_NOCHANNEL:
        res.statusCode = 404;
        break;
      case channels.ERROR_SAVECHANNEL:
        res.statusCode = 500;
        break;
      case channels.ERROR_SUCCESS:
        res.statusCode = 200;
        break;
      default:
        res.statusCode = 500;
    }
    res.json(rtn);
  })();
});

module.exports = router;
