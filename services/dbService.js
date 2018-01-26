"use strict";
let mysql = require('mysql');
let moment = require('moment');
let config = require('config');
let log = require('../tools/log');

let pool = null;

function DbService() {
  this.startup();
}

DbService.prototype.exec = function (options) {
  let self = this;
  return new Promise(function (resolve, reject) {
      pool.getConnection((err, conn) => {
        if (err) {
          resolve({
            errorCode: self.ERROR_GETCONNECTION,
            msg: '[得到数据库连接错误]' + err.message
          })
        }
        else {
          conn.query(options, (err, results, fields) => {
            if (err) {
              resolve({
                errorCode: self.ERROR_EXECERROR,
                msg: '[SQL执行错误]' + err.message
              })
            }
            else {
              conn.release();
              resolve({
                errorCode: self.ERROR_SUCCESS,
                msg: '[执行成功]',
                data: {
                  results: results,
                  fields: fields
                }
              })
            }
          })
        }
      })
    }
  )
};

DbService.prototype.saveLoan = async function ({ticketId, cityId, phone, name, gender, amount}) {
  return await  this.exec({
    sql: 'insert into loan (TICKID,CITYID,PHONE,NAME,AMOUNT,GENDER,TIMESTAMP) values(?,?,?,?,?,?,?)',
    timeout: 40000,
    values: [ticketId, cityId, phone, name, amount, gender, moment().format('YYYY-MM-DD HH:mm:ss.SSS')]
  });
};

DbService.prototype.saveTask = async function ({taskId, ticketId, channelId, taskState, planTime}) {
  return await  this.exec({
    sql: 'insert into loantask (TASKID, TICKID, CHANNELID, STATE, PLANTIME) values(?,?,?,?,?)',
    timeout: 40000,
    values: [taskId, ticketId, channelId, taskState, planTime]
  })
};

DbService.prototype.updateTask = async function ({taskId, state, msg}) {
  return await this.exec({
    sql: 'UPDATE `LOANTASK`  set `STATE`=?,`DESC`=?,`EXECTIME`=? where `TASKID`=?',
    timeout: 40000,
    values: [state, msg, moment().format('YYYY-MM-DD HH:mm:ss'), taskId]
  });
};

DbService.prototype.getChannelCities = async function () {
  return await this.exec({
    sql: 'SELECT CHANNELID,CITYID,CHANNELCITYID from CHANNELCITY',
    timeout: 60000
  })
};

DbService.prototype.startup = function () {
  log.info('连接数据库。。。');
  pool = mysql.createPool(config.get('db'));
};


DbService.prototype.shutdown = function () {
  pool.end();
};

DbService.prototype.ERROR_GETCONNECTION = -1;
DbService.prototype.ERROR_EXECERROR = -2;
DbService.prototype.ERROR_SUCCESS = 0;

module.exports = new DbService();
