"use strict";
let express = require('express');
let router = express.Router();
let moment = require('moment');

let tasks = require('../domain/tasks');

//GET /tasks?filter=channelCount&startDate=&endDate=

router.get('/', function(req, res, next) {
  switch(req.params[filter].toUpperCase()) {
    case 'CHANNELCOUNT':
      (async() => {
        let {errorCode, msg, data} = tasks.queryChannelCountByDate(req.param.startDate, req.param.endDate);
        if(errorCode !== tasks.ERROR_SUCCESS) {
          res.StatusCode = 407;
          res.json({
            errorCode: 407,
            msg: '查询错误，请检查请求参数'
          });
        }
        else {
          res.StatusCode = 200;
          res.json({
            errorCode: 200,
            msg: '请求成功',
            data: data
          });
        }
      })();
      break;
    default:
      res.StatusCode = 400;
      res.json({
        errorCode: 400,
        msg: '请求参数错误'
      })
      break;
  }
});

module.exports = router;
