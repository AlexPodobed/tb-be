angular.module("tb-bot")
    .controller("MainCtrl", ["$scope", "Bot", "socket", function ($scope, Bot, socket) {
        $scope.greeting = "Hello World";
        $scope.buildHash = {};
        console.log("main controller");

        $scope.removeBuilding = function (villageId, buildingId) {
            console.log(villageId, buildingId);
            removeElementFromList($scope.buildHash[villageId].buildQueue, buildingId);
            socket.emit('remove-from-queue', {
                villageId: villageId,
                buildId: buildingId
            });
        };

        $scope.triggerAutoBuilding = function(villageId, village){
            village.isLoop = !village.isLoop;

            socket.emit('trigger-auto-building', {
                villageId: villageId,
                isLoopActive: village.isLoop
            });
        };
        function removeElementFromList (arr, id) {
            var el;

            for (var i = 0; i < arr.length; i++) {
                if (arr[i].id === id) {
                    el = arr[i];
                    arr.splice(i, 1);
                    break;
                }
            }
            return el;
        };

        Bot.getAllDetails.get(function (res) {
            $scope.buildHash = res.data.buildHash;
        });

        socket.on('get-info', function(data){
            console.log('get-info', data);
        });

        socket.on('add-to-queue-all', function(data){
            $scope.buildHash[data.villageId].buildQueue = data.buildList;
        });
        socket.on('remove-from-list', function (data) {
            console.log(data)
            removeElementFromList($scope.buildHash[data.villageId].buildQueue, data.buildId);
        });
        socket.emit('get-info');
    }]);