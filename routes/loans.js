"use strict";

var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  let postData = {};
    try{
      postData = req.json();
    }catch{

    }
});

module.exports = router;
