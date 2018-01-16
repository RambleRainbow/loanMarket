"use strict";
let _ = require('lodash');
let crypto = require('crypto');
let moment = require('moment');

let db = require('../services/dbService');
let dispTasks = require('./dispTasks.js');
let cityService = require('../services/cityService');


function Loans() {
}

Loans.prototype.makeTicketId = function ({city, phone, name, gender, amount}) {
  let hash = crypto.createHash('sha256');
  let data = city + phone + name + gender + amount + (new Date()).valueOf().toString() +  Math.random().toString();
  hash.update(data);
  return hash.digest('HEX');
};

Loans.prototype.createTasks = function(loanItem) {
  let tasks = [];

  if(loanItem.amount <= 5 && cityService.haveCityIn(loanItem.city, cityService.CHANNELID_NIWODAI)){
    tasks.push({
      channelId: cityService.CHANNELID_NIWODAI,
      ticketId: loanItem.ticketId,
      planTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      loan: loanItem
    })
  }

  if(loanItem.amount >= 5 && cityService.haveCityIn(loanItem.city, cityService.CHANNELID_RONGZI)){
    tasks.push({
      channelId: cityService.CHANNELID_RONGZI,
      ticketId: loanItem.ticketId,
      planTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      loan: loanItem
    })
  }

  if(loanItem.amount >= 3 && cityService.haveCityIn(loanItem.city, cityService.CHANNELID_HAODAI)){
    tasks.push({
      channelId: cityService.CHANNELID_HAODAI,
      titicketId: loanItem.ticketId,
      planTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      loan: loanItem
    })
  }

  return tasks;
};

Loans.prototype.create = async function ({city, phone, name, gender, amount}) {
  let loanItem = _.extend(arguments[0], {ticketId: ''});
  loanItem.ticketId = this.makeTicketId(arguments[0]);

  let rtn = await db.saveLoan(loanItem);
  if (rtn.errorCode != 0) {
    return {
      errorCode: this.ERROR_DBOPT,
      msg: '数据库保存失败'
    }
  }

  let tasks = this.createTasks(loanItem);
  dispTasks.create(tasks);

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
