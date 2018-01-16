"use strict";
let bb = require('bluebird');
let request = require('request');
let _ = require('lodash');
let requestAsync = bb.promisify(request);
let cityTransService = require('./cityService');

function NiwodaiService() {
  this.ChannelId = cityTransService.CHANNEL_NIWODAI;

  this.url = "http://api.niwodai.org/interface/callHttpInterfaces.do";
  this.appId = "APItest";
  this.appKey = "niwodai88";
  this.sourceId = "";
  this.nwd_ext_aid = "5020160023536001";

  this.req_accessCode = "514b3233-4854-4325-81ef-fd1823fded09";

  this.apiDefs = {
    getToken: () => {
      return {
        accessCode: "c659d189-8653-4b71-adc8-4934febff124",
        json: {
          appId: this.appId,
          appKey: this.appKey
        }
      }
    },

    loanAPI: () => {
      return {
        accessCode: "514b3233-4854-4325-81ef-fd1823fded09",
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
    }
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
    let rtn = await this.post(data);
    return rtn;
  })();
};

NiwodaiService.prototype.doLoan = function ({cityId, phone, realName, gender, amount}) {
  return (async () => {
    let token = await this.getTokenAPI();
    if (token.success !== 1) {
      return {
        errorCode: -10001,
        msg: '[Token读取失败]:' + JSON.stringify(token)
      }
    }

    let params = {
      cityName: cityTransService.trans(cityId, cityTransService.CITYGROUP_NIWODAI),
      phone,
      realName,
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
