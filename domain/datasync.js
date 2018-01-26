"use strict";
let odb = require('oracledb');
let fs = require('fs');
let _ = require('lodash');
let loans = require('./loans');
let log = require('../tools/log');
let config = require('config');

const INTERVAL_SYNC = config.get('datasync.interval');
const SYNC_LIMIT = config.get('datasync.limit');;
const FILE_LOG = './synccounter.txt';


const odbconfig = config.get('datasync.db');

function DataSync() {
}

DataSync.prototype.getCurFlag = async function () {
  try {
    let s = fs.readFileSync(FILE_LOG).toString();
    return  Number.parseInt(s);
  }
  catch (e) {
    return 0;
  }
};

DataSync.prototype.setCurFlag = async function (curFlag) {
  try {
    fs.writeFileSync(FILE_LOG, curFlag);
  }
  catch (e) {

  }
};

DataSync.prototype.getNewRecords = async function (curFlag) {
  return new Promise((resolve, reject) => {
    odb.getConnection(
      odbconfig,
      function (err, conn) {
        if (err) {
          log.error(err);
          resolve([]);
          return;
        }

        let sql =
          `select * from (
            select *
            from v_users
            where id > :flag
            order by id
          ) where rownum <= :limit`;
        log.debug('exec sql: ' + sql);
        conn.execute(
          sql,
          {flag: curFlag,limit: SYNC_LIMIT},
          function (err, result) {
            if (err) {
              log.error(err);
              conn.close();
              resolve([]);
              return;
            }
            log.info('得到新记录' + result.rows.length + '条');

            let metaArray = _.map(result.metaData, it => {
              return it.name;
            });
            let rtn = _.chain(result.rows)
              .map( item => {
                return _.zip(metaArray, item);
              })
              .map( item => {
                return _.fromPairs(item);
              })
              .value();
            resolve(rtn);
          }
        )
      }
    )
  })
};

DataSync.prototype.syncData = function () {
  let self = this;
  (async () => {
    let curFlag = await self.getCurFlag();
    log.info('current sorted flag is:' + curFlag);
    let newRecords = await self.getNewRecords(curFlag);

    if (newRecords.length > 0) {
      log.info('write new sorted flag:' + newRecords[newRecords.length-1].ID);
      await self.setCurFlag(newRecords[newRecords.length-1].ID);

      let datas = newRecords.map(it => {
        return {
          cityId: it.WORKCITY,
          phone: it.TEL,
          name: it.USERNAME,
          gender: it.GENDER,
          amount: it.LOANS
        }
      });

       for (let i = 0; i < datas.length; i++) {
         let rtn = await loans.create(datas[i]);
         if(rtn.errorCode === 0) {
           log.info('第' + (i+1) + '条发送成功:' + rtn.msg);
         }
         else {
           log.error('第' + (i+1) + '条发送失败:' + rtn.msg);
         }

       }
    }
    setTimeout(function(){self.syncData();}, INTERVAL_SYNC);
  })();
};

let handle = new DataSync();

module.exports = handle;
