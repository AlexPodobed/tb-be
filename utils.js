var autoBuilder = require('./modules/autobuilder');
var Utils = {};

Utils.removeElementFromList = function (arr, id) {
    var el;

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            el = arr[i];
            arr.splice(i, 1);
            break;
        }
    }
    return el;
};

Utils.addToQueue = function(data, buildHash) {
    var currentVillage = buildHash[data.villageId];

    if (!currentVillage) {
        currentVillage = {
            name: data.villageName,
            isLoop: false,
            buildQueue: []
        }
        buildHash[data.villageId] = currentVillage;
    }

    currentVillage.buildQueue.push(data.buildDetails);
};

Utils.removeFromQueue = function (data, buildHash) {
    var currentBuildQueue = buildHash[data.villageId].buildQueue;
    Utils.removeElementFromList(currentBuildQueue, data.buildId);
}

Utils.triggerAutoBuilding = function(ctrl, data, buildHash, comunication) {
    var currentVillageId = data.villageId;
    var currentBuildControls = ctrl[currentVillageId];

    buildHash[currentVillageId].isLoop = data.isLoopActive;
 
    if (!currentBuildControls) {
        console.log('ctrl: created new')
        currentBuildControls = {
            instance: autoBuilder.autoBuilderConstructor(buildHash, currentVillageId, comunication)
        };
        ctrl[currentVillageId] = currentBuildControls;
    }

    var instance = ctrl[currentVillageId].instance;

    if (buildHash[currentVillageId].isLoop) {
      instance.test();
       /* instance.notifyUser("info", buildHash[currentVillageId].name, 'auto-building started');
        instance.start(data.timer);*/
    } else {
        /*instance.notifyUser("info", buildHash[currentVillageId].name, 'auto-building stopped');
        instance.stop();*/
    }
};
module.exports = Utils;