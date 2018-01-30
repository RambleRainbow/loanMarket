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

  if(amount >= 5 && await cityService.haveCityIn(cityId, dicts.channel.CHANNEL_RONGZI)){
    tasks.push({
      channelId: dicts.channel.CHANNEL_RONGZI,
      planTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
    })
  }

  if(amount >= 3 && await cityService.haveCityIn(cityId, dicts.channel.CHANNEL_HAODAI)){
    tasks.push({
      channelId: dicts.channel.CHANNEL_HAODAI,
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

Loans.prototype.ERROR_DBOPT = -10001;

module.exports = new Loans();
