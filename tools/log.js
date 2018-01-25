// JavaScript source code

var log4js = require('log4js');

log4js.configure({
    appenders: {
        console: { type: 'console' },
        filelog: { type: 'dateFile', filename: './logs/loanMarket.log', pattern: '_yyyy-MM-dd'}
    },
    categories: {
        default: { appenders: ['console', 'filelog'], level: 'ALL'}
    },
    replaceConsole: true
})

module.exports = log4js.getLogger();
