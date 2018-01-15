"use strict"
require('should');
let utt = require('../../services/haodaiService.js');

describe('好贷接口测试', function() {
  it('正确调用', function(done) {

    (async() => {
      let testData = {
        cityId: '110100',
        phone: '13916900000',
        realName: '张三',
        amount: 1
      };
      let data = await utt.loanAPI(testData);

      console.log(data);
      data.should.have.property('code').which.is.Number();
      data.code.should.equal(1000);
      done();
    })();
  });
});
