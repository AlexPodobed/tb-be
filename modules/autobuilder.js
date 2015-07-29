var Utils = require("../utils");

module.exports = {
	/* comunication - > {io, socket}*/
	autoBuilderConstructor: function  (buildHash, currentVillageId, comunication) {
		console.log('autobuild cnstrtr');

		return {
			test: function(){
				console.log("activate")
			}
		}
	}
}