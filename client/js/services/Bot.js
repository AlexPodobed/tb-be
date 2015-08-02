angular.module("tb-bot")
    .service("Bot", ["$resource", function ($resource) {
        return {
            getAllDetails: $resource("http://localhost:3000/api/check")
        }
    }]);