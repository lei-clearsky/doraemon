'use strict';

app.factory('Modal', function ($http, $modal) {
    return {
        openModal: function (imgID, size, animation, tempUrl, ctrl) {
            var modalInstance = $modal.open({
                animation: animation,
                templateUrl: tempUrl,
                controller: ctrl,
                size: size,
                resolve: {
                    viewDiff: function($http) {
                        return $http.get('/api/screenshots/diff/' + imgID)
                            .then(function(response) {
                                return response.data;
                        });
                    }
                    // ,
                    // viewImgCapture: function($http) {
                    //     return $http.get('/api/imageCaptures/imageCapture/' + imgID)
                    //         .then(function(response) {
                    //             return response.data;
                    //     });
                    // }
                }
            });
        }
    }
});