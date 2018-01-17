"use strict";

let nwdService = require('../services/niwodaiService.js');
let rzService = require('../services/rongziService.js');
let hdService = require('../services/haodaiService.js');

function Channels() {
}

Channels.prototype.postTask = async function(task) {
  let rtn;
  switch (task.channelId) {
    case nwdService.ChannelId:
      rtn = await nwdService.doLoan(task);
      break;
    case rzService.ChannelId:
      rtn = await rzService.doLoan(task);
      break;
    case hdService.ChannelId:
      rtn = await hdService.doLoan(task);
      break;
    default:
      rtn = {
        errorCode: this.ERROR_NOMATCHCHANNEL,
        msg: '未找到合适的推送通道'
      };
  }
  return rtn;
};

Channels.prototype.ERROR_SUCCESS = 0;
Channels.prototype.ERROR_NOMATCHCHANNEL = -1;

module.exports = new Channels();
