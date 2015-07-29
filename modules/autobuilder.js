var Utils = require("../utils");
var rootUrl = "http://tx3.travian.co.uk/";

module.exports = {
	/* comunication - > {io, socket}*/
	autoBuilderConstructor: function  (buildHash, villageId, comunication) {
		var buildList = buildHash[villageId].buildQueue;
		var buildingObj = buildHash[villageId];
		var villageName = buildHash[villageId].name;
		var parseStringToDate = Utils.parseStringToDate;
		var iterator = Utils.Iterator(buildList);
		var timerId;



		return {
			test: function(){
				console.log("activate")
			}
		}
	}
}