var request = require('request');
var cheerio = require('cheerio');
var FileCookieStore = require('tough-cookie-filestore');
var Utils = require('./modules/utils');
var Q = require('q');
var async = require('async');

var j = request.jar(new FileCookieStore('./cookies.json'));
request = request.defaults({ jar : j });

var rootUrl = "http://tx3.travian.co.uk/";

var accountSettings = {
  name: "aridon2",
  password: "podobed123",
  s1: "Login",
  w: "1366:768"
};


var $;




var checkLogIn = function checkLogIn(callback) {
  console.log("checkLogIn")
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
}


var login = function login(isLoggedIn, $, callback) {
    if(isLoggedIn){
      console.log('not loged in')
      accountSettings.login = $("form[name=login] input[name=login]").val();
        request.post({url: rootUrl + 'dorf1.php', form: accountSettings}, function (err, httpResponse, body) {
          if (!err) {
            $ = cheerio.load(body);
            console.log("successfully logged in", $("form[name=login]").length, $("#sidebarBoxHero").length);
            callback(null);
          } else {
            // error
          }
        });
    } else {
      console.log('loged in')
      callback(null);
    }
}

var getBuildDetail = function getBuildDetail(id) {

    return function(callback) {
        console.log('getBuildDetail')
        request(rootUrl + "build.php?id=" + id, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                $ = cheerio.load(body);
                callback(null, $);
            } else {
                // error
                console.log('error')
            }
        });
    }


}

var checkBuildingsDetails = function checkBuildingsDetails($, callback) {

    console.log('checkBuildingsDetails')

    var $btn = $("#contract button").first();

    if ($btn.hasClass("green build")) {
        var timeToWait = Utils.parseStringToDate($("#contract .clocks").text());
        var buildIrl = $btn.attr('onclick').split("'")[1];

        callback(null, {
            timer: timeToWait,
            url: buildIrl
        });
    } else {
        console.log("error")
        var errorObj = {
            message: " something went wrong",
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
}

var build = function build (obj, callback) {
    console.log('build',obj);
    request(rootUrl + obj.url, function  (  error, response, body) {
        if (!error && response.statusCode == 200) {
          callback(null, obj);
        } else {
          // error
        }
    })
}

async.waterfall([
    checkLogIn,
    login,
    getBuildDetail(35),
    checkBuildingsDetails,
    build
  ], function  (  err, result) {
      if(err) {
        console.log(err);
        return
      }

      console.log("done",result)
  });

