"use strict";
require('should');
var utt = require('../../services/yixinService.js');

describe('宜信接口测试', function() {

  it('接口正确调用', async(done) =>  {
    let test = {
      cityName: '',
      phone: '13916900000',
      realName: '张三',
      gender: '男',
      amount: 1
    };

    let rtn = await utt.cluesAPI(test);

    rtn.should.have.property('code').which.is.String();
    rtn.code.should.equal('0');
  })
});
