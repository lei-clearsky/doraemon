'use strict';

app.factory('Modal', function ($http, $modal) {
    return {
        openModal: function (diffImgID, size, animation, tempUrl, ctrl) {
            var modalInstance = $modal.open({
                animation: animation,
                templateUrl: tempUrl,
                controller: ctrl,
                size: size,
                resolve: {
                    viewDiff: function($http) {
                        return $http.get('/api/screenshots/diff/' + diffImgID)
                            .then(function(response) {
                                return response.data;
                        });
                    }
                }
            });
        }
    }
});