"use strict";
let bb = require('bluebird');
let requestAsync = bb.promisify(require('request'));

function YixinService() {
  this.uid = "aa";
  this.token = "xx";

  this.apiDefs = {
    cluesAPI: (() => {
      return {
        url: 'https://xdhk.yixin.com/api_test/clues',
        param: {
          uid: this.uid,
          token: this.token,
          product_type: "2",//1:车贷 2：信贷 5：房贷 6：小微贷 7：农贷 8：商通贷
          orgin: "",//客户来源，缺省为空
          market_channel: ""//营销渠道，缺省为空
        },
        data: {
          name: "",//客户姓名
          phone: "",//联系方式
          city: "",//城市

          source_id: "",//此条数据的原始id，可用于需要时 进行回溯
          product_type: 2,//1:车贷 2：信贷 5：房贷 6：小微贷 7：农贷 8：商通贷
          origin: "",//客户来源
          origin_extrainfo: "",//用于记录客户来源的额外信息
          market_channel: "",//客户营销渠道；
          email: "",
          qq: "",
          gender: "",//男、女
          birth_date: "",//格式：yyyy-MM-dd
          identity_number: "",//身份证
          education: "",//最高学历
          marital_status: "",//婚姻状况
          registered_addr: "",//户籍地址
        }
      }
    })()
  }
};

YixinService.prototype.cluesAPI = async function({cityName,phone, realName,}){

}
