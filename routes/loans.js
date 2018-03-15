"use strict";

var express = require('express');
var router = express.Router();
var loans = require('../domain/loans.js');

/* GET home page. */
router.post('/', function (req, res, next) {
  (async () => {
    try {
      let postData = req.body;
      let rtn = await loans.create(postData);
      if (rtn.errorCode !== 0) {
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

router.get('/', function (req, res, next) {
  (async() => {
    try {
      let rtn = null;
      let filterType = req.query.filter ? req.query.filter.toUpperCase() : 'DATE';
      switch (filterType) {
        case 'DATE':
          rtn = await loans.queryByDate(req.query.date, req.query.limit);
          break;
        case 'MINID':
          rtn = await loans.queryByMinId(req.query.minid, req.query.limit);
          break;
        default:
          res.statusCode = 405;
          rtn = {
            errorCode: 405,
            msg: '不支持的查询类型'
          };
          break;
      }
      res.json(rtn)
    }
    catch(err) {
      let rtn = null;
      if(err.Code) {
        switch(err.Code) {
          case loans.ERROR_DATEFORMAT:
            res.statusCode = 412;
            rtn = {
              errorCode: 412,
              msg: err.message
            };
            break;
          case loans.ERROR_RANGE:
            res.statusCode = 416;
            rtn = {
              errorCode: 412,
              msg: err.message
            }
            break;
          default:
            res.statusCode = 500;
            rtn = {
              errorCode: 500,
              msg: '未知错误:' + err.message
            }
            break;
        }
      } else {
        res.statusCode = 500;
        rtn = {
          errorCode: 500,
          msg: '未知错误:' + err.message
        };
      }
      res.json(rtn);
    }
})();
});

module.exports = router;
