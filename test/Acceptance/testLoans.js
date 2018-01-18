"use strict";
require('should');
let sinon = require('sinon');
let _ = require('lodash');

let loans = require('../../domain/loans');
let db = require('../../services/dbService');
let dicts = require('../../domain/dicts.js');
let cities = require('../../domain/cities');
let nwd = require('../../services/niwodaiService');
let hd = require('../../services/haodaiService');
let rz = require('../../services/rongziService');


function objEqualto(objPart, objAll) {
  _.forIn(objPart, (value, key) => {
    objAll.should.have.property(key, value);
  });
}

describe('提交申请', function () {
  let nwdMock;
  let dbMock;
  let testData;

  before(() => {
    db.startup();
  });

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

  it('当向平台提交申请时，应生成对应的申请数据库记录,以及发送任务记录', async () => {
    let spyLoan = sinon.spy(db, 'saveLoan');
    let spyTask = sinon.spy(db, 'saveTask');

    let rtn = await loans.create(testData);

    console.log(rtn);

    rtn.should.have.property('errorCode', 0);
    spyLoan.calledOnce.should.equal(true);
    objEqualto(testData, spyLoan.getCall(0).args[0]);
    objEqualto({
        ticketId: spyLoan.getCall(0).args[0].ticketId,
        taskState: dicts.taskState.TASKSTATE_INIT
      },
      spyTask.getCall(0).args[0]
    );

    spyLoan.restore();
    spyTask.restore();
  });

  //目前来说，发送任务的生成和和发送任务的更新记录是同时产生的
  it('当把贷款向发送后，应该更新发送记录', async () => {
    let spyUpdateTask = sinon.spy(db, 'updateTask');
    let spySaveTask = sinon.spy(db, 'saveTask');
    let exp = sinon.stub(nwd, 'doLoan').resolves({errorCode: 0, msg: '测试发送成功状态'});

    let rtn = await loans.create(testData);

    rtn.should.have.property('errorCode', 0);
    objEqualto({
      taskId: spySaveTask.getCall(0).args[0].taskId,
      state: dicts.taskState.TASKSTATE_SUCCESS
    }, spyUpdateTask.getCall(0).args[0]);

    exp.restore();
    exp = sinon.stub(nwd, 'doLoan').resolves({errorCode: -1, msg: '测试发送失败状态'});
    await loans.create(testData);
    spyUpdateTask.getCall(1).args[0].state.should.equal(dicts.taskState.TASKSTATE_FAIL);

    spyUpdateTask.restore();
    spySaveTask.restore();
    exp.restore();

  });

  afterEach(function () {
    nwdMock.restore();
    dbMock.restore();
  });

  after(() => {
    db.shutdown();
  })
});

describe('当提交申请时，应该根据规则发送向指定的网站', () => {
  //let expNwdDoLoan;
  //let expRzDoLoan;
  //let expHdDoLoan;
  let nwdMock;
  let hdMock;
  let rzMock;
  before(() => {
    db.startup();

  });

  beforeEach(() => {
    nwdMock = sinon.mock(nwd);
    hdMock = sinon.mock(hd);
    rzMock = sinon.mock(rz);
    //expNwdDoLoan = nwdMock.expects('doLoan').resolves({errorCode: 0, msg: '1你我贷测试代理：成功'});
    //expRzDoLoan = rzMock.expects('doLoan').resolves({errorCode: 0, msg: '融资网测试代理：成功'});
    //expHdDoLoan = hdMock.expects('doLoan').resolves({errorCode: 0, msg: '好贷网测试代理：成功'});
  });

  describe('你我贷发送逻辑', () => {
    it('当额度小于等于5W，城市列表符合你我贷网要求，则向你我贷发送', async function () {
      let testData = {
        cityId: '110000',
        phone: '13916900000',
        name: '张三',
        gender: 1,
        amount: 5
      };
      let exp = nwdMock.expects('doLoan').resolves({errorCode: 0, msg: '测试成功'});

      await loans.create(testData);

      exp.calledOnce.should.equal(true);
      objEqualto(testData, exp.getCall(0).args[0]);
    });

    it('当额度大于5W或者你我贷不支持的城市，则不你我贷发送', async function () {
      let testDatas = [{
        cityId: '110000',
        phone: '13916900000',
        name: '张三',
        gender: 1,
        amount: 6
      },
        {
          cityId: '12310000',
          phone: '13916900000',
          name: '张三',
          gender: 1,
          amount: 5
        },
        {
          cityId: '12310000',
          phone: '13916900000',
          name: '张三',
          gender: 1,
          amount: 6
        }];

      let exp = nwdMock.expects('doLoan').resolves({errorCode: 0, msg: '测试成功'});

      await Promise.all(_.map(testDatas, (it) => {
        return (async () => {
          await loans.create(it);
        })();
      }));

      exp.callCount.should.equal(0);
    });
  });

  describe('好贷发送逻辑', () => {
    it('贷款额度>=3W，并且符合城市', async() => {
      await cities.init();
      //cityId, phone, name, gender, amount
      let testData = [
        [ '110000','13916900000','张三',1, 3, true],
        [ '110000','13916900000','张三',1, 4, true],
        [ '110000x','13916900000','张三',1, 3, false],
        [ '110000x','13916900000','张三',1, 2, false],

         [ '131000','13916900000','张三',1, 3, true],
         [ '131000','13916900000','张三',1, 4, true],
         [ '131000x','13916900000','张三',1, 3, false],
        [ '131000x','13916900000','张三',1, 2, false]
      ];

      hdMock.restore();
      for(let i = 0; i <testData.length; i++) {
        hdMock = sinon.mock(hd);
        let exp = hdMock.expects('doLoan').resolves({errorCode: 0, msg: '好贷测试逻辑'});
        let data = {
          cityId: testData[i][0],
          phone: testData[i][1],
          name: testData[i][2],
          gender: testData[i][3],
          amount: testData[i][4]
        };

        await loans.create(data);

        exp.calledOnce.should.equal(testData[i][5]);
        hdMock.restore();
      }
    });
  });

  describe('东方融资网发送逻辑', () => {
    it('贷款额度>=5W，并且符合城市', async() => {
      await cities.init();
      //cityId, phone, name, gender, amount
      let testData = [
        [ '320200','13916900000','张三',1, 5, true],
        [ '320200','13916900000','张三',1, 6, true],
        [ '320200','13916900000','张三',1, 4, false],
        [ '320200','13916900000','张三',1, 3, false],

        [ '450400','13916900000','张三',1, 5, false],
        [ '450400','13916900000','张三',1, 4, false],
        [ '450400','13916900000','张三',1, 3, false],
        [ '450400','13916900000','张三',1, 2, false]
      ];

      rzMock.restore();
      for(let i = 0; i <testData.length; i++) {
        console.log(testData[i]);
        rzMock = sinon.mock(rz);
        let exp = rzMock.expects('doLoan').resolves({errorCode: 0, msg: '东方融资网测试逻辑'});
        let data = {
          cityId: testData[i][0],
          phone: testData[i][1],
          name: testData[i][2],
          gender: testData[i][3],
          amount: testData[i][4]
        };

        await loans.create(data);

        exp.calledOnce.should.equal(testData[i][5]);
        rzMock.restore();
      }
    });
  });

  afterEach(() => {
    nwdMock.restore();
    hdMock.restore();
    rzMock.restore();
    //expNwdDoLoan.restore();
    //expRzDoLoan.restore();
    //expHdDoLoan.restore();
  });

  describe('好贷网：额度<=3W,城市', function() {

  });

  after(() => {
    db.shutdown();
  });
});
