"use strict";
let mysql = require('mysql');
let bb = require('bluebird');
let moment = require('moment');

let pool = mysql.createPool({
  connectionLimit : 10,
  host            : '127.0.0.1',
  user            : 'root',
  password        : '1234',
  database        : 'loan'
});
bb.promisifyAll(pool);

function DbService() {
}

DbService.prototype.exec = async(options) => {
  try{
    let conn = await pool.getConnectionAsync();
    bb.promisifyAll(conn);
    let rtn = await conn.queryAsync( options );
    return {
      errorCode: 0,
      msg: '调用成功'
    }
  }
  catch(e) {
    return {
      errorCode: -1,
      msg: e.message
    }
  }

}

DbService.prototype.saveLoan = async function({ticketId, cityId, phone, name, gender, amount}) {
  return await  this.exec({
    sql: 'insert into loan (TICKID,CITYID,PHONE,NAME,AMOUNT,GENDER,TIMESTAMP) values(?,?,?,?,?,?,?)',
      timeout: 40000,
      values: [ticketId,cityId,phone,name,amount,gender,moment().format('YYYY-MM-DD HH:mm:ss.SSS')]
  });
};

DbService.prototype.saveTask = async function({taskId,ticketId,channelId,taskState, planTime}) {
  return await  this.exec({
    sql: 'insert into loantask (TASKID, TICKID, CHANNELID, STATE, PLANTIME) values(?,?,?,?,?)',
    timeout: 40000,
    values: [taskId, ticketId,channelId,taskState, planTime]
  })
};

DbService.prototype.updateTask = async function({taskId,state, msg}) {
  return await this.exec( {
    sql: 'UPDATE `LOANTASK`  set `STATE`=?,`DESC`=?,`EXECTIME`=? where `TASKID`=?',
    timeout: 40000,
    values:[state, msg, moment().format('YYYY-MM-DD HH:mm:ss'), taskId]
  });
};

module.exports = new DbService();
