"use strict";
let mysql = require('mysql');
let moment = require('moment');

let pool = null;

function DbService() {
}

DbService.prototype.exec = function (options) {
  let self = this;
  return new Promise(function(resolve, reject) {
      pool.getConnection((err, conn) => {
        if (err) {
          conn.release();
          reject({
            errorCode: self.ERROR_GETCONNECTION,
            msg: '[得到数据库连接错误]' + err.message
          })
        }
        conn.query(options, (err, results, fields) => {
          if (err) {
            conn.release();
            reject({
              errorCode: self.ERROR_EXECERROR,
              msg: '[SQL执行错误]' + err.message
            })
          }

          conn.release();
          resolve({
            errorCode: self.ERROR_SUCCESS,
            msg: '[执行成功]',
            data: {
              results: results,
              fields: fields
            }
          })
        })
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

DbService.prototype.startup = function() {
  pool = mysql.createPool({
    connectionLimit: 10,
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'loan'
  });
};


DbService.prototype.shutdown = function() {
  pool.end();
};

DbService.prototype.ERROR_GETCONNECTION = -1;
DbService.prototype.ERROR_EXECERROR = -2;
DbService.prototype.ERROR_SUCCESS = 0;

module.exports = new DbService();
