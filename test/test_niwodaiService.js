"use strict"
require('should');
let utt = require('../services/niwodaiService.js');

describe('你我贷接口测试', function () {
  it("getToken接口调用", function (done) {
    (async () => {
      let data = await utt.getTokenAPI();
      data.success.should.equal(1);
      data.data.should.have.property('accessToken').which.is.a.String();
      data.data.accessToken.should.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      done();
    })();
  });

  it("申请贷款接口调用", function (done) {
    (async () => {
      let token = await utt.getTokenAPI();
      let data = await utt.loanAPI({
        phone: '13916900004',//注你我贷 按手机号进行的重复处理
        realName: '张三1',
        cityName: '北京',
        amount: 1,
        token: token.data.accessToken
      })
      console.log(JSON.stringify(data));
      data.success.should.equal(1);
      done();
    })();
  })
});
