"use strict";

var express = require('express');
var router = express.Router();
var loans = require('../domain/loans.js');

/* GET home page. */
router.post('/', function (req, res, next) {
  (async () => {
      try {
        let postData = req.body;
        if(rtn.errorCode !== 0) {
          let rtn = await loans.create(postData);
          res.status(422);
          res.json(rtn);
        }
        else {
          res.status(201);
          res.json(rtn);
        }
      } catch (e) {
        res.status(500);
        res.json(e);
      }
    })();
});

module.exports = router;
