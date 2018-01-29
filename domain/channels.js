"use strict";
let yaml = require('js-yaml');
let fs = require('fs');
let _ = require('lodash');

let nwdService = require('../services/niwodaiService.js');
let rzService = require('../services/rongziService.js');
let hdService = require('../services/haodaiService.js');
let db = require('../services/dbService');
let dict = require('./dicts');
let config = require('config');


const PATH_CHANNEL = 'data/channels.yml';

let channels = [];//config.get('channels');

function Channels() {
  this.init();
}

Channels.prototype.init = function() {
  try {
    channels = yaml.safeLoad(fs.readFileSync(PATH_CHANNEL, 'utf8'),{schema: yaml.JSON_SCHEMA});
  }
  catch(err) {
    channels = config.get('channels');
  }
};

Channels.prototype.readAll = async function () {
  return {
    errorCode: 0,
    msg: '调用成功',
    data: channels
  };
};

Channels.prototype.updateIsOpen = async function({id, isOpen}) {
  let channel = _.filter(channels, (item) => {
    return item.id === id;
  });
  if(channel.length !== 1) {
    return {
      errorCode: this.ERROR_NOCHANNEL,
      msg:'未找到对应的通道'
    };
  }
  else {
    let oldValue = channel[0].isOpen;
    channel[0].isOpen = (isOpen === true);
    try {
      fs.writeFileSync(PATH_CHANNEL, yaml.safeDump(channels,{schema: yaml.JSON_SCHEMA}));
      return {
        errorCode: 0,
        msg:'通道配置成功'
      }
    }
    catch(err) {
      channel[0].isOpen = oldValue;
      return {
        errorCode: this.ERROR_SAVECHANNEL,
        msg: '通道配置保存失败'
      }
    }
  }
};
// Channels.prototype.modify = async function ({id, info}) {
//   let channel = _.filter(channels, (item) => {
//     return item.id === id
//   });
//   if (channel.length !== 1) {
//     return {
//       errorCode: this.ERROR_NOCHANNEL,
//       msg: '未找到对应的通道'
//     }
//   }
//   else {
//     let rtn = await db.exec({
//       sql: 'UPDATE CHANNEL SET ISOPEN=? WHERE ID=?',
//       timeout: 40000,
//       values: [info.isOpen, channel[0].id]
//     });
//     if (rtn.errorCode === 0) {
//       channel[0].isOpen = info.isOpen;
//       return {
//         errorCode: this.ERROR_SUCCESS,
//         msg: "更新成功"
//       }
//     }
//     else {
//       return {
//         errorCode: this.ERROR_DBOPT,
//         msg: rtn.msg
//       }
//     }
//   }
// };

Channels.prototype.isChannelOpen = function(channelId) {
  for(let i = 0; i < channels.length; i++) {
    if(channels[i].id === channelId) {
      return channels[i].isOpen;
    }
  }

  return false;
}

Channels.prototype.postTask = async function (task) {
  let rtn;

  if(! this.isChannelOpen(task.channelId)) {
    return {
      errorCode: this.ERROR_CHANNELCLOSED,
      msg: '通道已关闭'
    }
  }

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
Channels.prototype.ERROR_NOCHANNEL = -2;
Channels.prototype.ERROR_DBOPT = -3;
Channels.prototype.ERROR_SAVECHANNEL = -4;

module.exports = new Channels();
