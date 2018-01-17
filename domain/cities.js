"use strict";
//TODO: city service
function CityService() {
}

CityService.prototype.trans = function(cityId, cityGroup) {
};

CityService.prototype.haveCityIn = function(cityId, channelId) {
  return true;
};

// CityService.prototype.CHANNEL_HAODAI = 10;
// CityService.prototype.CHANNEL_RONGZI = 20;
// CityService.prototype.CHANNEL_NIWODAI = 30;
// CityService.prototype.CHANNEL_YIXIN = 50;


module.exports = new CityService();
