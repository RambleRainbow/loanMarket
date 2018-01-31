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
  log.debug('SQL执行：' + options.sql);
  return new Promise(function (resolve, reject) {
      pool.getConnection((err, conn) => {
        if (err) {
          log.debug('SQL执行错误:' + err.message);
          resolve({
            errorCode: self.ERROR_GETCONNECTION,
            msg: '[得到数据库连接错误]' + err.message
          })
        }
        else {
          conn.query(options, (err, results, fields) => {
            if (err) {
              log.debug('SQL执行错误:' + err.message);
              resolve({
                errorCode: self.ERROR_EXECERROR,
                msg: '[SQL执行错误]' + err.message
              })
            }
            else {
              conn.release();
              log.debug('SQL执行成功');
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
    sql: 'insert into LOAN (TICKID,CITYID,PHONE,NAME,AMOUNT,GENDER,TIMESTAMP) values(?,?,?,?,?,?,?)',
    timeout: 40000,
    values: [ticketId, cityId, phone, name, amount, gender, moment().format('YYYY-MM-DD HH:mm:ss.SSS')]
  });
};

DbService.prototype.saveTask = async function ({taskId, ticketId, channelId, taskState, planTime}) {
  return await  this.exec({
    sql: 'insert into LOANTASK (TASKID, TICKID, CHANNELID, STATE, PLANTIME) values(?,?,?,?,?)',
    timeout: 40000,
    values: [taskId, ticketId, channelId, taskState, planTime]
  })
};

DbService.prototype.updateTask = async function ({taskId, state, msg}) {
  return await this.exec({
    sql: 'UPDATE `LOANTASK`  set `STATE`=?,`DESC`=?,`EXECTIME`=? where `TASKID`=?',
    timeout: 40000,
    values: [state, msg, moment().format('YYYY-MM-DD HH:mm:ss.SSS'), taskId]
  });
};

DbService.prototype.getChannelCities = async function () {
  return await this.exec({
    sql: 'SELECT CHANNELID,CITYID,CHANNELCITYID from CHANNELCITY',
    timeout: 60000
  })
};

DbService.prototype.queryLoansByDate = async function(dateStart, dateEnd, queryLimit) {
  return await this.exec({
    sql: `
      SELECT L.ID,C.CHANNELCITYID,L.PHONE,L.NAME,L.GENDER,L.AMOUNT,T.CHANNELID,T.STATE,T.DESC,L.TIMESTAMP
      FROM (SELECT * 
             FROM LOAN 
             WHERE TIMESTAMP >= ? 
               AND TIMESTAMP <= ? 
             ORDER BY ID DESC 
             LIMIT ?) AS L, 
            LOANTASK AS T, 
            CHANNELCITY AS C
      WHERE L.TICKID = T.TICKID 
        AND C.CITYID = L.CITYID 
        AND C.CHANNELID = 40
    `,
    values: [dateStart, dateEnd, queryLimit],
    timeout: 60000
  });
};

DbService.prototype.queryLoansByMinId = async function(minid, limit) {
  return this.exec( {
    sql: `
      SELECT L.ID,C.CHANNELCITYID,L.PHONE,L.NAME,L.GENDER,L.AMOUNT,T.CHANNELID,T.STATE,T.DESC,L.TIMESTAMP
      FROM (SELECT * 
             FROM LOAN 
             WHERE ID < ?
             ORDER BY ID DESC 
             LIMIT ?) AS L, 
            LOANTASK AS T, 
            CHANNELCITY AS C
      WHERE L.TICKID = T.TICKID 
        AND C.CITYID = L.CITYID 
        AND C.CHANNELID = 40
    `,
    values: [minid, limit],
    timeout: 60000
  });
};

DbService.prototype.startup = function () {
  log.info('创建连接池');
  pool = mysql.createPool(config.get('db'));
};


DbService.prototype.shutdown = function () {
  pool.end();
};

DbService.prototype.ERROR_GETCONNECTION = -1;
DbService.prototype.ERROR_EXECERROR = -2;
DbService.prototype.ERROR_SUCCESS = 0;

module.exports = new DbService();
