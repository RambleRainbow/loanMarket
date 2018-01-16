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

DbService.prototype.saveLoan = async({ticketId, city, phone, name, gender, amount}) => {
  try{
    let conn = await pool.getConnectionAsync();
    bb.promisifyAll(conn);
    let rtn = await conn.queryAsync( {
      sql: 'insert into loan (TICKID,CITYID,PHONE,NAME,AMOUNT,GENDER,TIMESTAMP) values(?,?,?,?,?,?,?)',
      timeout: 40000,
      values: [ticketId,city,phone,name,amount,gender,moment().format('YYYY-MM-DD HH:mm:ss.SSS')]
    });
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
};

module.exports = new DbService();
