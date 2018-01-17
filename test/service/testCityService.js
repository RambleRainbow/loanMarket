"use strict";
require('should');

let utt = require('../../domain/cities.js');

describe('初始化', function() {

  it('初始化成功', async() => {
    await utt.init();
  });
});
