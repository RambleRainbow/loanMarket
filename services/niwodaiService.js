"use strict";
let bb = require('bluebird');
let request = require('request');
let _ = require('lodash');
let requestAsync = bb.promisify(request);


let cities = require('../domain/cities.js');
let dicts = require('../domain/dicts.js');
let config = require('config');

function NiwodaiService() {
  this.ChannelId = dicts.channel.CHANNEL_NIWODAI;

  this.url = config.get('chncfg.niwodai.url');
  this.appId = config.get('chncfg.niwodai.appId');
  this.appKey = config.get('chncfg.niwodai.appKey');
  this.sourceId = config.get('chncfg.niwodai.sourceId');
  this.nwd_ext_aid = config.get('chncfg.niwodai.nwd_ext_aid');

  this.apiDefs = {
    getToken: () => {
      return {
        accessCode: config.get('chncfg.niwodai.accessCode.getToken'),
        json: {
          appId: this.appId,
          appKey: this.appKey
        }
      }
    },

    loanAPI: () => {
      return {
        accessCode: config.get('chncfg.niwodai.accessCode.loan'),
        json: {
          //参数字段
          cityName: "",
          phone: "",
          realName: "",
          amount: 0,
          token: "",

          //固定字段
          nwd_ext_aid: this.nwd_ext_aid,
          sourceId: this.sourceId,

          //默认字段
          time: (new Date()).valueOf(),
          age: 0,
          birthTime: '2000-01-01 00:00:00',
        }
      }
    }
  }
}

NiwodaiService.prototype.post = function (data) {
  return (async () => {
    let postData = {
      accessCode: data.accessCode,
      jsonParam: JSON.stringify(data.json)
    };
    let rtn = await requestAsync({
      url: this.url,
      method: 'POST',
      form: postData
    });
    return JSON.parse(rtn.body);
  })();
};

NiwodaiService.prototype.getTokenAPI = function () {
  return (async () => {
    let data = this.apiDefs.getToken();
    return await this.post(data);
  })();
};

NiwodaiService.prototype.loanAPI = function ({cityName, phone, realName, amount, token}) {
  return (async () => {
    let data = this.apiDefs.loanAPI();
    data.json  = _.extend(data.json, arguments[0]);
    return  await this.post(data);
  })();
};

NiwodaiService.prototype.doLoan = function ({cityId, phone, name, gender, amount}) {
  return (async () => {
    let token = await this.getTokenAPI();
    if (token.success !== 1) {
      return {
        errorCode: -10001,
        msg: '[Token读取失败]:' + JSON.stringify(token)
      }
    }

    let params = {
      cityName: await cities.id2Name(cityId, this.ChannelId),
      phone,
      realName: name,
      amount,
      token: token.data.accessToken
    };
    let rtn = await this.loanAPI(params);
    if(rtn.success !== 1) {
      return {
        errorCode: -10002,
        msg:'[借款失败]：' + JSON.stringify(rtn)
      }
    }

    return {
      errorCode: 0,
      msg: '[发送成功]：' + JSON.stringify(rtn)
    }
  })();
};

module.exports = new NiwodaiService();
