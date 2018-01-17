"use strict";
let _ = require('lodash');
let crypto = require('crypto');
let moment = require('moment');

let db = require('../services/dbService');
let dispTasks = require('./dispTasks.js');
let cityService = require('./cities');
let dicts = require('./dicts.js');


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
      planTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    })
  }

  if(amount >= 5 && await cityService.haveCityIn(cityId, dicts.channel.CHANNEL_RONGZI)){
    tasks.push({
      channelId: dicts.channel.CHANNEL_RONGZI,
      planTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    })
  }

  if(amount >= 3 && await cityService.haveCityIn(cityId, dicts.channel.CHANNEL_HAODAI)){
    tasks.push({
      channelId: dicts.channel.CHANNEL_HAODAI,
      planTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    })
  }

  return tasks;
};

Loans.prototype.create = async function ({cityId, phone, name, gender, amount}) {
  let loanItem = _.extend(arguments[0], {ticketId: ''});
  loanItem.ticketId = this.makeTicketId(arguments[0]);

  let rtn = await db.saveLoan(loanItem);
  if (rtn.errorCode !== db.ERROR_SUCCESS) {
    return {
      errorCode: this.ERROR_DBOPT,
      msg: '[数据库保存失败]' + rtn.msg
    }
  }

  let tasks = await this.createTasks(loanItem);
  for(let i = 0; i <tasks.length; i++) {
    await dispTasks.create(_.extend(tasks[i], loanItem));
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
