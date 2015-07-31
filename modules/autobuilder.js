var FileCookieStore = require('tough-cookie-filestore');
var Utils = require("./utils.js");
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var colors = require('colors');

var Q = require('q');


var j = request.jar(new FileCookieStore('./cookies.json'));
var accountSettings = require('../config/accounSettings.js');
var rootUrl = "http://tx3.travian.co.uk/";
var $;

var colorHash = {
    "success": 'green',
    "info": "blue",
    "error": "red"
};

request = request.defaults({ jar : j });

module.exports = {
	autoBuilderConstructor: function  (buildHash, villageId, comunication) {
		var buildList = buildHash[villageId].buildQueue;
		var buildingObj = buildHash[villageId];
		var villageName = buildHash[villageId].name;
		var iterator = Utils.Iterator(buildList);
		var timerId;

        var checkLogIn = function checkLogIn(callback) {
            console.log("checkLogIn".gray)
            request(rootUrl + "dorf1.php", function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    $ = cheerio.load(body);
                    if ($("form[name=login]").length) {
                        // on the login page, need to log in
                        callback(null, true, $);
                        return;
                    } else {
                        callback(null, false, $);

                    }
                } else {
                    // error
                }
            });
        };

        var login = function login(isLoggedIn, $, callback) {
            if (isLoggedIn) {
                console.log('not loged in'.gray)
                accountSettings.login = $("form[name=login] input[name=login]").val();
                request.post({
                    url: rootUrl + 'dorf1.php',
                    form: accountSettings
                }, function(err, httpResponse, body) {
                    if (!err) {
                        $ = cheerio.load(body);
                        console.log("successfully logged in".cyan, $("form[name=login]").length, $("#sidebarBoxHero").length);
                        callback(null);
                    } else {
                        // error
                    }
                });
            } else {
                console.log('loged in'.gray)
                callback(null);
            }
        };

        var getBuildDetail = function getBuildDetail(build) {
            return function(callback) {
                console.log('getBuildDetail'.gray)
                request(rootUrl + "build.php?newdid=" +villageId+ "&id="+build.id, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        $ = cheerio.load(body);
                        callback(null, $);
                    } else {
                        // error
                        console.log('error'.red)
                    }
                });
            }
        };

        var checkBuildingsDetails = function checkBuildingsDetails($, callback) {
            console.log('checkBuildingsDetails'.gray)

            var $btn = $("#contract button").first();

            if ($btn.hasClass("green build")) {
                var timeToWait = Utils.parseStringToDate($("#contract .clocks").text());
                var buildIrl = $btn.attr('onclick').split("'")[1];

                callback(null, {
                    timer: timeToWait,
                    url: buildIrl
                });
            } else {
                console.log("error".red)
                var errorObj = {
                    message: " something went wrong"
                };
                if ($btn.attr('value') === "Exchange resources") {
                    errorObj.message = " not enough resources";
                } else if ($btn.attr('value') === "Construct with master builder") {
                    errorObj.message = " not finished upgrading";
                } else if ($("#contract >span.none").length) {
                    errorObj.message = " has been fully upgraded";
                }

                callback(errorObj)
            }
        };

        var build = function build(obj, callback) {
            console.log('build:'.blue, Utils.getCurrentTime());
            request(rootUrl + obj.url, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    callback(null, obj);
                } else {
                    // error
                }
            })
        };

        function removeBuiltField(currentObj) {
            iterator.index -= 1;
            Utils.removeElementFromList(buildList, currentObj.id);
            comunication.io.emit("remove-from-list", {villageId: villageId, buildId: currentObj.id});
        }

        function notifyUser(type, title, message) {
            console.log(colors[colorHash[type]].bold(type, title, message));

            comunication.io.emit('auto-build-event', {
                type: type,
                title: title,
                message: message
            });
        }


		function stopRecursive () {
			buildingObj.isLoop = false;
		    iterator.reset();
		    clearTimeout(timerId);
		}
        function errorHandler(err){
            console.log(Utils.getCurrentTime(), err);
            stopRecursive();
            notifyUser('error', villageName, err.message);
        }
        function startRecursive() {
            if (iterator.hasNext() && buildingObj.isLoop) {
                var currentObj = iterator.next();

                console.log(colors.yellow(new Array(80).join("-"))); // remove it
                console.log("Iterator Index:", iterator.index);

                async.waterfall([
                    checkLogIn,
                    login,
                    getBuildDetail(currentObj),
                    checkBuildingsDetails,
                    build
                ], function(err, result) {
                    if (err) {
                        errorHandler(err);
                        return
                    }
                    removeBuiltField(currentObj);
                    notifyUser('success', villageName, currentObj.name + " successfully started building");
                    timerId = setTimeout(startRecursive, result.timer + 2000);
                    console.log(colors.yellow(new Array(80).join("-"))); // remove it
                });
            } else {
                notifyUser('info', "auto-build", "FINISHED");
                stopRecursive();
            }
        }
        function start(delay) {
            var time = Utils.parseStringToDate(delay);
            timerId = setTimeout(startRecursive, time);
        }
        return {
            stop: stopRecursive,
            start: start,
            notifyUser: notifyUser
        }
    }
};
