"use strict";
let db = require('../services/dbService.js');
let _ = require('lodash');
let crypto = require('crypto');
let moment = require('moment');

let channels = require('./channels.js');
let dicts = require('./dicts.js');
let log = require('../tools/log');

let m_tasks = [];

function DispTasks() {

}

DispTasks.prototype.postTaskToChannel = async function() {

  log.debug('有效任务共' + m_tasks.length + '个');
  let taskGroup = _.chain(m_tasks)
    .groupBy((it) => { return it.planTime <= moment().format('YYYY-MM-DD HH:mm:ss') ? 'valid':'delay'})
    .value();

  let validTasks = taskGroup.hasOwnProperty('valid') ? taskGroup.valid : [];
  m_tasks = taskGroup.hasOwnProperty('delay')? taskGroup.delay : [];
  var rtn;

  for(let i = 0; i < validTasks.length; i++ ) {
    log.debug('发送任务:' + validTasks[i].taskId);
    let rtnPort = await channels.postTask(validTasks[i]);
    if(rtnPort.errorCode === 0) {
      log.info('任务发送成功：' + validTasks[i].taskId + ',' + rtnPort.msg);
      rtn = await this.updateTask(validTasks[i].taskId, dicts.taskState.TASKSTATE_SUCCESS, rtnPort.msg);
    }
    else
    {
      log.error('任务发送失败：' + validTasks[i].taskId + ',' + rtnPort.msg);
      rtn = await this.updateTask(validTasks[i].taskId, dicts.taskState.TASKSTATE_FAIL, rtnPort.msg);
    }
  }

  return rtn;
};

DispTasks.prototype.updateTask = async function(taskId, state, msg) {
  let dbRtn = await db.updateTask({taskId, state, msg});
  return dbRtn;
}

DispTasks.prototype.saveTask = async function(taskDO){
  let dbRtn = await db.saveTask(taskDO);
  return dbRtn;
};

DispTasks.prototype.makeTaskId = function() {
  let sha = crypto.createHash('sha256');
  let data = JSON.stringify(arguments[0]) + (new Date()).valueOf().toString() + Math.random().toString();
  sha.update(data);
  return sha.digest('hex');
};

DispTasks.prototype.create = async function({channelId, planTime, cityId, phone, name, gender, amount}) {
  let taskDO = _.extend(arguments[0], {
    taskId: this.makeTaskId(arguments[0]),
    orgTaskId: '',
    taskState: dicts.taskState.TASKSTATE_INIT
  });
  let rtn = await this.saveTask(taskDO);
  log.info('保存分发任务：' + rtn.msg);

  if(rtn.errorCode === 0) {
    m_tasks.push(taskDO);
    log.info('向渠道派发数据:' + taskDO);
    await this.postTaskToChannel();
  }
};

// DispTasks.prototype.TASKSTATE_PENDING = 1;
// DispTasks.prototype.TASKSTATE_FAIL = 2;
// DispTasks.prototype.TASKSTATE_SUCCESS = 3;

module.exports = new DispTasks();
