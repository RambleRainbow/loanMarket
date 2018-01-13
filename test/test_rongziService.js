"use strict"
require('should');
let utt = require('../services/rongziService.js');

describe('签名算法', function() {
    it('签名', function() {
        let sign = "";
        sign = utt.sign('False', '20180110153243');
        sign.should.equal('c2811f9ef79401933559ddde528a9c72');

        sign = utt.sign('10008081230', '20160828202045');
        sign.should.equal('40b1bfaddee69c77acf4ca0c4c1ea582');
    })
});

describe('东方融资网《是否注册》接口测试', function() {
    it('未注册手机调用', function(done) {
        (async() => {
            let testData = {
                phone: '13912121212',
            };
            let data = await utt.isRegisteredAPI(testData);

            console.log(data);
            data.should.have.property('Code').which.is.String();
            data.Code.should.equal('0');//调用成本

            data.should.have.property('IsRegistered').which.is.Boolean();
            data.IsRegistered.should.equal(false);//未注册

            done();
        })();
    });

  it('已注册手机调用', function(done) {
    (async() => {
      let testData = {
        phone: '13912121212',
      };
      let data = await utt.isRegisteredAPI(testData);

      console.log(data);
      data.should.have.property('Code').which.is.String();
      data.Code.should.equal('0');//调用成本

      data.should.have.property('IsRegistered').which.is.Boolean();
      data.IsRegistered.should.equal(false);//未注册

      done();
    })();
  });
});

describe('东方融资网《注册》接口测试', function() {
    it('正确调用', function(done) {
        (async() => {
            let testData = {
                cityName: 'shanghai',
                phone: '13916900000',
                realName: '张三',
                gender: 1,
                amount: 5
            };

            let data =await utt.Register(testData);
            console.log(data);
            data.should.have.property('Code').which.is.String();
            data.Code.should.equal('0');//调用成功

            data.should.have.property('IsRegistered').which.is.Boolean();
            data.isRegistered = false;//未注册

            done();
        })();
    });
});
