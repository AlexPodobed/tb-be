angular.module("tb-bot")
    .controller("MainCtrl", ["$scope", "Bot", "socket", function ($scope, Bot, socket) {
        $scope.greeting = "Hello World";
        $scope.shared = {};
        console.log("main controller");

        $scope.removeBuilding = function (villageId, buildingId) {
            console.log(villageId, buildingId);
        };

        Bot.getAllDetails.get(function (res) {
            $scope.shared.buildHash = res.data.buildHash;
        });

        socket.on('get-info', function(data){
            console.log('get-info', data);
        });

        socket.emit('get-info');
    }])