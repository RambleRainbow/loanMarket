"use strict";
require('should');
let sinon = require('sinon');
let _ = require('lodash');

let loans = require('../../domain/loans');
let nwd = require('../../services/niwodaiService');
let db = require('../../services/dbService');

describe('提交申请', function () {
  let nwdMock;
  let dbMock;
  let testData;
  beforeEach(function () {
    nwdMock = sinon.mock(nwd);
    dbMock = sinon.mock(db);
    testData = {
      cityId: '110000',
      phone: '13916900000',
      name: '张三',
      gender: 1,
      amount: 1
    };
  });

  it('当向平台提交申请时，应向对应的贷款网站提交数据', function (done) {
    (async () => {
      let exp = nwdMock.expects('doLoan').resolves({errorCode: 0, msg: '调用1成功'});

      let rtn = await loans.create(testData);

      console.log(rtn);
      rtn.should.have.property('errorCode');
      rtn.errorCode.should.equal(0);
      exp.calledOnce.should.equal(true);
      _.forIn(testData, (value, key) => {
        exp.getCall(0).args[0][key].should.equal(value);
      });
      done();
    })();
  });

  afterEach(function () {
    nwdMock.restore();
    dbMock.restore();
    db.shutdown();
  });
});
