"use strict";
require('should');
let sinon = require('sinon');
let _ = require('lodash');

let loans = require('../../domain/loans.js');
let db = require('../../services/dbService.js');
let dispTasks = require('../../domain/dispTasks.js');
let cityService = require('../../domain/cities');

describe("[贷款] create操作", function() {
  let dbMock;
  let dispTasksMock;
  let cityServiceMock;
  beforeEach(function() {
    dbMock = sinon.mock(db);
    dispTasksMock = sinon.mock(dispTasks);
    cityServiceMock = sinon.mock(cityService);
  });

  it("常规操作，应该正确操作", async() => {
    let testData = {
      city: '110000',
      phone: '13916900000',
      name: '张三',
      gender: 1,
      amount: 1
    };
    let fakeTicketId = '123456789012345678901234567890cd';

    let dbExp = dbMock.expects('saveLoan').resolves({errorCode:0});
    let expMakeTicketId = sinon.stub(loans, 'makeTicketId').returns(fakeTicketId);
    dispTasksMock.expects('create').resolves({errorCode: 0});
    cityServiceMock.expects('haveCityIn').returns(true);

    let rtn = await loans.create(testData);

    rtn.should.have.property('errorCode', 0);
    rtn.should.have.property('msg','调用成功');
    rtn.should.have.property('data').which.is.Object();
    rtn.data.ticketId.should.match(/[0-9a-z]{32}/);

    dbExp.calledOnce.should.equal(true);
    dbExp.calledWith(_.extend(testData, {ticketId: fakeTicketId})).should.equal(true);
    expMakeTicketId.restore();
  });

  it("当数据库返回失败时，也应该返回失败", async() => {
    dbMock.expects('saveLoan').resolves({errorCode: -1});
    let rtn = await loans.create({});
    rtn.should.have.property('errorCode', loans.ERROR_DBOPT);
    rtn.should.have.property('msg', '数据库保存失败')
  });

  it("即使使用相同数据进行申请时，每次返回不同的ticketId", async() => {
    let testData = {
      city: '110000',
      phone: '13916900000',
      name: '张三',
      gender: 1,
      amount: 1
    };
    dbMock.expects('saveLoan').resolves({errorCode: 0});
    dbMock.expects('saveLoan').resolves({errorCode: 0});
    let rtn = await loans.create(testData);
    let h1 = rtn.data.ticketId;

    rtn = await loans.create(testData);
    let h2 = rtn.data.ticketId;

    h1.should.not.equal(h2);
  });

  afterEach(function() {
    dbMock.restore();
    dispTasksMock.restore();
    cityServiceMock.restore();
  });
});


// describe('[UT]贷款发送逻辑生成', () => {
//   beforeEach(function() {
//     var cityServiceMock = sinon.mock(cityService);
//   });
//
//   it('<5w', async(done) => {
//
//   });
//
//   afterEach(function() {
//     cityServiceMock.restore();
//   });
// });
