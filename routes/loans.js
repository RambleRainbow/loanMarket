"use strict";

var express = require('express');
var router = express.Router();
var loans = require('../domain/loans.js');

/* GET home page. */
router.post('/', function (req, res, next) {
  (async () => {
    try {
      let postData = req.body;
      if (rtn.errorCode !== 0) {
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

  // if(req.query.date) {
  //   res.json([
  //     {id: 14, name: '张三14', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 10, state: 2}]},
  //     {id: 13, name: '张三13', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 20, state: 2}]},
  //     {id: 12, name: '张三12', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 30, state: 2}]},
  //     {id: 11, name: '张三11', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 10, state: 2}]},
  //     {id: 10, name: '张三10', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 20, state: 2}]},
  //     {id: 9, name: '张三9', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 30, state: 2}]},
  //     {id: 8, name: '张三8', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 10, state: 2}]},
  //     {id: 7, name: '张三7', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 20, state: 2}]},
  //     {id: 6, name: '张三6', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 30, state: 2}]},
  //     {id: 5, name: '张三5', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 10, state: 2}]},
  //     {id: 4, name: '张三4', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 20, state: 2}]},
  //     {id: 3, name: '张三3', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 30, state: 2}]},
  //     {id: 2, name: '张三2', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 10, state: 2}]},
  //     {id: 1, name: '张三1', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 20, state: 2}]}
  //   ]);
  // }
  // else if(req.query.minid) {
  //   res.json([
  //     {id: 14, name: '李四14', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 10, state: 2}]},
  //     {id: 13, name: '李四13', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 20, state: 2}]},
  //     {id: 12, name: '李四12', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 30, state: 2}]},
  //     {id: 11, name: '李四11', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 10, state: 2}]},
  //     {id: 10, name: '李四10', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 20, state: 2}]},
  //     {id: 9, name: '李四9', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 30, state: 2}]},
  //     {id: 8, name: '李四8', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 10, state: 2}]},
  //     {id: 7, name: '李四7', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 20, state: 2}]},
  //     {id: 6, name: '李四6', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 30, state: 2}]},
  //     {id: 5, name: '李四5', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 10, state: 2}]},
  //     {id: 4, name: '李四4', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 20, state: 2}]},
  //     {id: 3, name: '李四3', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 30, state: 2}]},
  //     {id: 2, name: '李四2', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 10, state: 2}]},
  //     {id: 1, name: '李四1', gender: 1, phone: '12345678901', timestamp: '2018-01-10', tasks: [{channelid: 20, state: 2}]}
  //   ]);
  // }
});

module.exports = router;
