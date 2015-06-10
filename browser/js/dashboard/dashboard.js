'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('dashboard', {
        url: '/dashboard',
        templateUrl: 'js/dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        resolve: {
            currentUser: ['AuthService', function(AuthService) {
                return AuthService.getLoggedInUser();
            }]
        }
    });

});

app.factory('Dashboard', function ($http) {

    return {
        getOne: function (id) {
            return $http.get('/api/screenshots/' + id)
                        .then(function (response) {
                            return response.data;
                        });
        },
        getDiffsByUserID: function (userID) {
            console.log('get diffs by userID');
            return $http.get('/api/screenshots/' + userID)
                        .then(function (response) {
                            return response.data;
                        })
        },
        searchDiffs: function (params) {
            return $http({
                url: '/api/screenshots/search',
                method: 'GET',
                params: params
            }).then(function(res) {
                return res.data;
            }).catch(function(err) {
                console.log(err);
                return err;
            })
        }
    };

});

app.controller('DashboardCtrl', function ($scope, Dashboard, $modal, currentUser) {
    $scope.keys = ['myKey.jpg', 'test1.png', 'test3.png', 'diff.png'];
    $scope.diffImgs = [];

    $scope.searchParams = {};

    $scope.searchDiffs = function () {
        Dashboard.searchDiffs($scope.searchParams)
            .then(function (returnedDiffImgs) {
                console.log('diff images ', returnedDiffImgs);
                $scope.diffImgs = returnedDiffImgs;
            });
    }
    
    Dashboard.getDiffsByUserID('557886debbc0aa642d30df38')
            .then(function (returnedDiffImgs) {
                console.log('tests by this user ', returnedDiffImgs);
                $scope.diffImgsByUser = returnedDiffImgs
            })


    $scope.keys.forEach(function(key, index) {
        $scope.diffImgs.push('https://s3.amazonaws.com/capstone-doraemon/' + key);
    });

    $scope.animationsEnabled = true;
    $scope.openDiffModal = function (size) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'js/dashboard/diff-modal.html',
            controller: 'DiffModalCtrl',
            size: size
        });
    }   

});

app.controller('DiffModalCtrl', function ($http, $scope, $modalInstance) {
    
    $scope.test = 'test';
    
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

app.filter('unique', function() {
   return function(collection, keyname) {
      var output = [], 
          keys = [];

      angular.forEach(collection, function(item) {
          var key = item[keyname];
          if(keys.indexOf(key) === -1) {
              keys.push(key);
              output.push(item);
          }
      });

      return output;
   };
});

























