"use strict";
require('should');

let utt = require('../../services/dbService.js');

describe('数据库服务调用', () => {
  it("调用", async() => {

      // let rtn = await utt.saveLoan({
      //   ticketId: '1',
      //   city: '1',
      //   phone: '1',
      //   name: '1',
      //   gender: 1,
      //   amount: 1
      // });

      rtn.should.have.property('errorCode');
      rtn.errorCode.should.equal(0);
  });
});
