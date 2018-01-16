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
  }
  return rtn;
};

module.exports = new Channels();
