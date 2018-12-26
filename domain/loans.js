"use strict";
let _ = require('lodash');
let crypto = require('crypto');
let moment = require('moment');

let db = require('../services/dbService');
let dispTasks = require('./dispTasks.js');
let cityService = require('./cities');
let dicts = require('./dicts.js');
let log = require('../tools/log');

function Loans() {
}

Loans.prototype.makeTicketId = function ({cityId, phone, name, gender, amount}) {
  let hash = crypto.createHash('sha256');
  let data = cityId + phone + name + gender + amount + (new Date()).valueOf().toString() +  Math.random().toString();
  hash.update(data);
  return hash.digest('HEX');
};

Loans.prototype.createTasks = async function({cityId, amount}) {
  let tasks = [];

  if(amount <= 5 && await cityService.haveCityIn(cityId, dicts.channel.CHANNEL_NIWODAI)){
    tasks.push({
      channelId: dicts.channel.CHANNEL_NIWODAI,
      planTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
    })
  }
  channelId: dicts.channel.CHANNEL_RONGZI,
    planTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
})
}

if(amount >= 3 && await cityService.haveCityIn(cityId, dicts.channel.CHANNEL_HAODAI)){
  tasks.push({
    channelId: dicts.cha

  if(amount >= 5 && await cityService.haveCityIn(cityId, dicts.channel.CHANNEL_RONGZI)){
    tasks.push({nnel.CHANNEL_HAODAI,
      planTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
    })
  }

  return tasks;
};

Loans.prototype.create = async function ({cityId, phone, name, gender, amount}) {
  let loanItem = _.extend(arguments[0], {ticketId: ''});
  loanItem.ticketId = this.makeTicketId(arguments[0]);

  log.info('创建贷款：' + loanItem.ticketId);

  //是否保存到本地文件
  let rtn = await db.saveLoan(loanItem);
  if (rtn.errorCode !== db.ERROR_SUCCESS) {
    log.error('保存数据库失败:' + rtn.msg);
    return {
      errorCode: this.ERROR_DBOPT,
      msg: '[数据库保存失败]' + rtn.msg
    }
  }
  log.info('数据库保存成功');

  log.info('创建分发任务...');
  let tasks = await this.createTasks(loanItem);

  for(let i = 0; i <tasks.length; i++) {
    let rtn = await dispTasks.create(_.extend(tasks[i], loanItem));
  }

  return {
    errorCode: 0,
    msg: '调用成功',
    data: {
      ticketId: loanItem.ticketId
    }
  }
};

Loans.prototype.queryByMinId = async function(minid, limit) {
  if(isNaN(minid)) {
    let err = new Error('参数错误');
    err.Code = Loans.prototype.ERROR_PARAM;
    throw err;
  }
  let queryId = minid;

  let queryLimit = (!isNaN(limit))? Number.parseInt(limit) : 20;

  let dbResults = await db.queryLoansByMinId(queryId,queryLimit);
  return this.processLoansResult(dbResults);
};

Loans.prototype.processLoansResult = function (dbResults){
  if(dbResults.errorCode !== db.ERROR_SUCCESS) {
    let err = new Error('数据库查询错误:' + dbResults.msg);
    err.Code = Loans.prototype.ERROR_DBOPT;
    throw err;
  }

  let rtn = _.chain(dbResults.data.results)
    .groupBy(it => { return it.ID;})
    .mapValues( it => {
      function maskPhone(phone){
        return phone.substring(0,3) + '****' + phone.substring(7);
      }

      let rtn = {
        id: it[0].ID,
        phone: maskPhone(it[0].PHONE),
        name: it[0].NAME,
        gender: it[0].GENDER === 1 ? '先生':'女士',
        amount: it[0].AMOUNT,
        city: it[0].CHANNELCITYID,
        time: it[0].TIMESTAMP,
        tasks: []
      };

      it.forEach(itTask => {
        rtn.tasks.push({
          channelid: itTask.CHANNELID,
          state: itTask.STATE,
          desc: itTask.DESC
        });
      });
      return rtn;
    })
    .values()
    .sortBy([it => { return it.id * -1;}])
    .value();
  return rtn;
};

Loans.prototype.queryByDate = async function(date, limit) {
  let queryDate;
  try{
    queryDate = date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
  }catch(e) {
    let err = new Error('日期格式错误，应为YYYY-MM-DD');
    err.Code = Loans.prototype.ERROR_DATEFORMAT;
    throw err;
  }
  let dateStart = queryDate + ' 00:00:00';
  let dateEnd = queryDate + ' 23.59.59.999';

  let queryLimit = (!isNaN(limit)) ? Number.parseInt(limit) : 20;
  if(queryLimit > 100 || queryLimit < 1 ) {
    let err = new Error('查询范围为1~100');
    err.Code = Loans.prototype.ERROR_RANGE;
    throw err;
  }

  let dbResults = await db.queryLoansByDate(dateStart, dateEnd, queryLimit);
  return this.processLoansResult(dbResults);
};

Loans.prototype.ERROR_DBOPT = -10001;
Loans.prototype.ERROR_RANGE = -10002;
Loans.prototype.ERROR_DATEFORMAT = -10003;

module.exports = new Loans();
