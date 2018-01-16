"use strict"
require('should');
let sinon = require('sinon');


let loans = require('../../domain/loans');
let nwd = require('../../services/niwodaiService');

describe('提交申请', function() {
  let nwdMock;
  beforeEach( function() {
    nwdMock = sinon.mock(nwd);
  })

  it('当向平台提交申请时，应向对应的贷款网站提交数据', function(done) {
    (async() => {
    let testData = {
      cityId: '110000',
      phone: '13916900000',
      name: '张三',
      gender: 1,
      amount: 1
    };
    let exp = nwdMock.expects('doLoan').resolves({errorCode: 0,msg: '调用1成功'});

    let rtn = await loans.create(testData);

    console.log(rtn);
    rtn.should.have.property('errorCode');
    rtn.errorCode.should.equal(0);
    exp.calledOnce.should.equal(true);

    done();
    })();
  });

  afterEach(function() {
    nwdMock.restore();
  });
});
