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
Utils.Iterator = function (arr) {
    function Iterator(items) {
        this.index = 0;
        this.items = items;
    };

    Iterator.prototype = {
        first: function () {
            this.reset();
            return this.next();
        },
        next: function () {
            return this.items[this.index++];
        },
        hasNext: function () {
            return this.index < this.items.length;
        },
        reset: function () {
            this.index = 0;
        },
        size: function () {
            return this.items.length
        }
    };

    return new Iterator(arr);
};
Utils.parseStringToDate = function (str) {
    var timeArr,
        h, m, s;

    timeArr = str.split(':');
    h = +timeArr[0];
    m = +timeArr[1];
    s = +timeArr[2];

    return h * 60 * 60 * 1000 + m * 60 * 1000 + s * 1000;
};
Utils.addToQueue = function (data, buildHash) {
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
Utils.getIdformUrl = function (str, match) {
    var query = str.substring(1).split("&"),
        id;

    query.map(function (keyVal) {
        var param = keyVal.split('=');
        if (param[0] === match) {
            id = param[1];
        }
    });
    return id;
};
Utils.removeFromQueue = function (data, buildHash) {
    var currentBuildQueue = buildHash[data.villageId].buildQueue;
    Utils.removeElementFromList(currentBuildQueue, data.buildId);
};

Utils.triggerAutoBuilding = function (ctrl, data, buildHash, comunication) {
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
        instance.test();
        /* instance.notifyUser("info", buildHash[currentVillageId].name, 'auto-building started');
         instance.start(data.timer);*/
    } else {
        /*instance.notifyUser("info", buildHash[currentVillageId].name, 'auto-building stopped');
         instance.stop();*/
    }
};


module.exports = Utils;
