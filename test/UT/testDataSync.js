"use strict";
require('should');

let utt = require('../../domain/datasync');

describe('data sync test', () => {
  it('do run', async() => {
    utt.syncData();
  });
});
