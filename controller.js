var autoBuilder = require('./modules/autobuilder');
var Utils = require('./modules/utils');
var Controller = {};


Controller.addToQueue = function (data, buildHash) {
    var currentVillage = buildHash[data.villageId];

    if (!currentVillage) {
        currentVillage = {
            name: data.villageName,
            isLoop: false,
            buildQueue: []
        };
        buildHash[data.villageId] = currentVillage;
    }

    currentVillage.buildQueue.push(data.buildDetails);
};

Controller.removeFromQueue = function (data, buildHash) {
    var currentBuildQueue = buildHash[data.villageId].buildQueue;
    Utils.removeElementFromList(currentBuildQueue, data.buildId);
};

Controller.triggerAutoBuilding = function (ctrl, data, buildHash, comunication) {
    var currentVillageId = data.villageId;
    var currentBuildControls = ctrl[currentVillageId];

    buildHash[currentVillageId].isLoop = data.isLoopActive;

    if (!currentBuildControls) {
        currentBuildControls = {
            instance: autoBuilder.autoBuilderConstructor(buildHash, currentVillageId, comunication)
        };
        ctrl[currentVillageId] = currentBuildControls;
    }

    var instance = ctrl[currentVillageId].instance;

    if (buildHash[currentVillageId].isLoop) {
         instance.notifyUser("info", buildHash[currentVillageId].name, 'auto-building started');
         if(data.timer){
             instance.start(data.timer);
         }else {
             instance.startBlind();
         }
    } else {
        instance.notifyUser("info", buildHash[currentVillageId].name, 'auto-building stopped');
        instance.stop();
    }
};


module.exports = Controller;
