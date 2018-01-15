require('should');
let sinon = require('sinon');
let nwd = require('../../services/niwodaiService.js');
let cityTransService = require('../../services/cityService.js');

describe('你我贷业务接口测试', function() {
  it('贷款申请', function(done) {
    (async() => {
      let mockCityTrans = sinon.mock(cityTransService);
      mockCityTrans.expects('trans').withArgs('110100', cityTransService.CITYGROUP_NIWODAI).returns('上海');

      let testData = {
        cityId: '110100',
        phone: '13916900004',
        realName: '李四',
        gender: '先生',
        amount: 1
      }

      let rtn = await nwd.doLoan(testData);
      console.log(rtn);
      rtn.should.have.property('errorCode').which.is.Number();
      rtn.errorCode.should.equal(0);
      rtn.should.have.property('msg').which.is.String();
      rtn.msg.should.equal('调用正确');

      mock.restore();

      done();
    })();
  })
});
