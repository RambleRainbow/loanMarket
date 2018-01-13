require('should');
var utt_nwd = require('../services/niwodaiService.js');

describe('你我贷业务接口测试', function() {
  it('贷款申请', function() {
    (async() => {
      let testData = {
        cityName: '上海',
        phone: '13916900004',
        realName: '李四',
        amount: 1
      }

      let rtn = await utt_nwd.doLoan(testData);
      rtn.should.have.property('errorCode').which.is.Number();
      rtn.errorCode.should.equal(0);
      rtn.should.have.property('msg').which.is.String();
      rtn.msg.should.equal('调用正确');

      done();
    })();
  })
});
