var request = require('request');
var cheerio = require('cheerio');
var FileCookieStore = require('tough-cookie-filestore');
var Utils = require('./modules/utils');
var Q = require('q');

/* npm install tough-cookie-filestore */

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


function getBuildDetail(id) {
  var deferred = Q.defer();
  request("http://tx3.travian.co.uk/build.php?id=" + id, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      if ($("form[name=login]").length) {
        // on the login page, need to log in
        login($, function(){
          getBuildDetail(id);
        });
        return;
      }
      deferred.resolve($);
    } else {
      deferred.rejet(error);
    }
  });

  return deferred.promise;
}

function login($) {
  var deferred = Q.defer();

  accountSettings.login = $("form[name=login] input[name=login]").val();

  request.post({url: rootUrl + 'dorf1.php', form: accountSettings}, function (err, httpResponse, body) {
    if (!err) {
      $ = cheerio.load(body);
      console.log("successfully logged in", $("form[name=login]").length, $("#sidebarBoxHero").length);
      // cb.apply(this, arguments);

      deferred.resolve();
    } else {
      console.log(err, httpResponse);
      deferred.reject(err);
    }
  });

  return deferred.promise;
}

function checkLogIn () {
  var deferred = Q.defer();

   request("http://tx3.travian.co.uk/dorf1.php", function (error, response, body) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      if ($("form[name=login]").length) {
        // on the login page, need to log in
        login($).then(function  () {
          deferred.resolve();
        })
        return;
      }
      deferred.resolve();
    } else {
      deferred.rejet(error);
    }
  });


  return deferred.promise;
}

function checkBuildingsDetails($){
    var deferred = Q.defer();
    var $btn = $("#contract button").first();

    if($btn.hasClass("green build")){
      var timeToWait = Utils.parseStringToDate($("#contract .clocks").text());
      var buildIrl = $btn.attr('onclick').split("'")[1];

      deferred.resolve({timer: timeToWait, url: buildIrl});
    } else {
      var errorObj = {
        message: " something went wrong",
      };
      if($btn.val() === "Exchange resources"){
        errorObj.message = " not enough resources";
      }else if($btn.val() === "Construct with master builder"){
        errorObj.message = " not finished upgrading";
      } else if($("#contract >span.none").size()){
        errorObj.message = " has been fully upgraded";
      }

      deferred.reject(errorObj);
    }
    return deferred.promise;
  }


console.log('run');


checkLogIn()
    .then(function() {
        getBuildDetail(27)
            .then(function($) {
                console.log(333, $(".titleInHeader").text(), $("#contract .clocks").text())
                checkBuildingsDetails($)
                  .then(function  (obj) {
                    console.log(obj);
                  }, function (err) {
                    console.log('error on checkBuildingsDetails step', err);
                  })
            }, function(){
              console.log('error on getBuildDetail step');
            })

    }, function  () {
      console.log('error on login step');
    })


/*getBuildDetail(8)
  .then(function  ($) {
    console.log(333, $(".titleInHeader").text(), $("#contract .clocks").text())
  })*/

// setTimeout(function () {
//   getBuildDetail(5);
// }, 10000);



/*
function getBuildDetail(id) {
  request("http://tx3.travian.co.uk/build.php?id=" + id, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      if ($("form[name=login]").length) {
        // on the login page, need to log in
        login($, function(){
          getBuildDetail(id);
        });
        return;
      }
      console.log(333, $(".titleInHeader").text(), $("#contract .clocks").text())
    }
  });
}
function login($, cb) {
  accountSettings.login = $("form[name=login] input[name=login]").val();
  request.post({url: rootUrl + 'dorf1.php', form: accountSettings}, function (err, httpResponse, body) {
    if (!err) {
      $ = cheerio.load(body);
      console.log("successfully logged in", $("form[name=login]").length, $("#sidebarBoxHero").length);
      cb.apply(this, arguments);
    } else {
      console.log(err, httpResponse);
    }
  });
}*/


/*var async = require('async');


async.waterfall([
    function(callback) {
      console.log(1, callback)
        callback(null, 'one', 'two');
    },
    function(arg1, arg2, callback) {
      console.log(1, arg1, arg2, callback)
      // arg1 now equals 'one' and arg2 now equals 'two'
        callback(null, 'three');
    },
    function(arg1, callback) {
      console.log(1, arg1, callback)
        // arg1 now equals 'three'
        callback(null, 'done');
    }
], function (err, result) {
    // result now equals 'done'
});*/