angular.module("tb-bot", ["ngAnimate", "ui.router", "ngResource", "btford.socket-io"])
    .config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('main', {
                url: "/main",
                templateUrl: "js/main/main.html",
                controller: "MainCtrl"
            });

        $urlRouterProvider.otherwise("/main");
    }])
    .factory('socket', function (socketFactory) {
        return socketFactory({
            ioSocket: io.connect('http://localhost:3000/')
        });
    });