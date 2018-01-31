"use strict";
let _ = require('lodash');
let db = require('../services/dbService.js');
let dicts = require('./dicts.js');

let m_dicts = null;

function CityService() {
}

CityService.prototype.init = async function () {
  if(m_dicts !== null) {
    return m_dicts;
  }

  let rows = await db.getChannelCities();
  m_dicts = _.chain(rows.data.results)
    .map((it) => {
      //前端传来的地名，需要做反向转换，从渠道地名，转为标准地址码
      return [it.CHANNELID, it.CITYID, it.CHANNELCITYID];
      // if (dicts.channel.CHANNEL_FRONT === it.CHANNELCITYID) {
      //   return [it.CHANNELID, it.CHANNELCITYID, it.CITYID];
      // }
      // else {
      //   return [it.CHANNELID, it.CITYID, it.CHANNELCITYID];
      // }
    })
    .groupBy((it) => {
      return it[0];
    })
    .mapValues((it) => {
      return  _.chain(it)
        .map((it) => {
          return [it[1], it[2]]
        })
        .fromPairs()
        .value();
    })
    .value();

  return {
    errorCode: this.ERROR_SUCCESS
  }
};

CityService.prototype.haveCityIn = async function (cityId, channelId) {
  if(m_dicts === null) {
    await this.init();
  }
  return m_dicts.hasOwnProperty(channelId) && m_dicts[channelId].hasOwnProperty(cityId);
};

CityService.prototype.id2Name = async function(cityId, channelId) {
  if(m_dicts === null) {
    await this.init();
  }

  if(channelId === dicts.channel.CHANNEL_FRONT) {
    //不可以等于前端通道，目前只支持其它的
    throw new Error('目前前端城市数据不支持（id=>名称）的查询');
  }

  return m_dicts[channelId][cityId];
};

CityService.prototype.name2Id = async function(cityName, channelId) {
  if(m_dicts === null) {
    await this.init();
  }

  if(channelId !== dicts.channel.CHANNEL_FRONT) {
    throw new Error('目前主支持前端数据的（名称=>id）查询')
  }

  return await this.id2Name(cityName, channelId);
};

CityService.prototype.ERROR_SUCCESS = 0;

module.exports = new CityService();
