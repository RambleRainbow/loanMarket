"use strict";

let nwdService = require('../services/niwodaiService.js');
let rzService = require('../services/rongziService.js');
let hdService = require('../services/haodaiService.js');
let cityService = require('../services/cityService.js');

function Channels() {
}

//TODO: Channels.postTask
Channels.prototype.postTask = async function({channelId,task}) {
  var rtn;
  switch (channelId) {
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
