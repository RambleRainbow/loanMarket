let Dicts = {
  taskState: {
    TASKSTATE_INIT: 1,
    TASKSTATE_FAIL: 2,
    TASKSTATE_SUCCESS: 3
  },
  channel: {
    CHANNEL_HAODAI: 10,
    CHANNEL_RONGZI: 20,
    CHANNEL_NIWODAI: 30,
    CHANNEL_FRONT: 40,
    CHANNEL_YIXIN: 50
  },
  gender: {
    male: 1,
    female:0
  },
  identity: {
    employee: 1,
    owner: 2,
    selfEmployed: 3,
    other: 4
  },
  workTime: {
    m3:0,
    m6:1,
    y1:2,
    y2:3,
    y3:4,
    y5:5,
    y10:6,
    oy10:7
  },
  residenceTime: {
    m3:0,
    m6:1,
    y1:2,
    y2:3,
    y3:4,
    y5:5,
    y10:6,
    oy10:7
  },
  estatePos: {
    center: 1,
    country: 2,
    nonlocal: 3
  },
  locationOfOperation: {
    sameAsLoanCity: 0,
    otherCity: 1
  },
  shareHolding: {
    p10: 0,
    p20:1,
    p50:2,
    p80:3,
    op80:4
  },
  licenceDuration:{
    m3:0,
    m6:1,
    y1:2,
    y2:3,
    y3:4,
    y5:5,
    y10:6,
    y15:7,
    oy15:8
  },
};

module.exports = Dicts;
