"use strict";
let _ = require('lodash');
let crypto = require('crypto');
let request = require('request');

function HaodaiService() {
  this.key = 'oadn8DkzKf0jvV0hi9fKxaiXSMktnYot';
  //this.key = 'oadn8DkzKf0jvV0h';
  this.params = {
    channel_id: 23,
    biaoshi: 19,
    field: ""
  };

  this.loanAPI = {
    url: "http://dev.oc.haodai.net/Center/pushOrder",
    params: {
      channel_id: 23,
      biaoshi: 19,
      field: ""
    },
    fieldData: {
      username: "",//用户名
      money: 0,//贷款金额，以元为单位
      zone_id: 0,//地区编码
      mobile: 0,//手机号码

      month: 0,//贷款期限，单位月
      age: 0,//年龄
      salary_bank_public: 0,//月收入，以元为单位
      salary_bank_private: 1,//工资发放形式（1银行代发 2转账工资 3现金发放 4自由职业收入)

      is_fund: null,//公积金  1有 2无
      is_security: null,//社保  1有 2无
      house_type: null, //房产  1无 2有，未抵押 3有，已抵押
      car_type: null,//车产  1无 2有，未抵押 3有，已抵押 4无，准备购买    }
    }
  };
};

HaodaiService.prototype.encrypt = function (data, key) {
  let iv = "";
  let clearEncoding = 'utf8';
  let cipherEncoding = 'base64';
  let cipherChunks = [];
  let cipher = crypto.createCipheriv('aes-256-ecb', key, iv);
  cipher.setAutoPadding(true);

  cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding));
  cipherChunks.push(cipher.final(cipherEncoding));

  return cipherChunks.join('');
};

HaodaiService.prototype.cryptoField = function (data) {
  let dataStr = JSON.stringify(data);

  return this.encrypt(dataStr, this.key)
};

HaodaiService.prototype.loan = function ({cityId, phone, realName, amount}) {
  return new Promise((resolve, reject) => {
    let postData = _.clone(this.params);
    let field = _.clone(this.loanAPI.fieldData);

    //必填字段
    field.username = realName;
    field.money = amount * 10000;
    field.zone_id = Number.parseInt(cityId);
    field.mobile = Number.parseInt(phone);

    //必填字段 默认值
    field.month = Math.ceil(Math.random() * 12) + 12;
    field.age = Math.ceil(Math.random() * 10) + 25;
    field.salary_bank_public = Math.ceil(Math.random() * 5000) + 300;
    field.salary_bank_private = 1;

    postData.field = this.cryptoField(field);

    let options = {
        url: 'http://dev.oc.haodai.net/Center/pushOrder',
        method: 'POST',
        json: true,
        headers: {
          'Content-Type': 'application/json'
        },
        body: postData
      }
    ;

    request(options,
      (err, res, body) => {
        if (err) {
          reject(err);
        }
        resolve(body);
      }
    );
  });
};

module.exports = new HaodaiService();
