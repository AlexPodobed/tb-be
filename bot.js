var request = require('request');
var cheerio = require('cheerio');
var FileCookieStore = require('tough-cookie-filestore');

/* npm install tough-cookie-filestore */

var j = request.jar(new FileCookieStore('cookies.json'));
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
  request("http://tx3.travian.co.uk/build.php?id=" + id, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      if ($("form[name=login]").length) {
        // on the login page, need to log in
        login($);
        return;
      }
      console.log(333, $(".titleInHeader").text())
    }
  });
}
function login($) {
  accountSettings.login = $("form[name=login] input[name=login]").val();
  request.post({url: rootUrl + 'dorf1.php', form: accountSettings}, function (err, httpResponse, body) {
    if (!err) {
      $ = cheerio.load(body);
      console.log("successfully logged in", $("form[name=login]").length, $("#sidebarBoxHero").length);
    } else {
      console.log(err, httpResponse);
    }
  });
}

console.log('run');


getBuildDetail(8);

setTimeout(function () {
  getBuildDetail(5);
}, 10000);
