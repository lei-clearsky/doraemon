'use strict';
app.config(function ($stateProvider) {

    $stateProvider.state('admin.diffs', {
        url: '/diffs',
        templateUrl: 'js/admin/diffs/diffs.html',
        controller: 'DiffsCtrl',
        resolve: {
            currentUser: function(AuthService) {
                return AuthService.getLoggedInUser()
                            .catch(function (err) {
                                console.log(err);
                            });
            },
            allDiffsByUser: ['currentUser', 'Dashboard', function(currentUser, Dashboard) {
                return Dashboard.allDiffsByUser(currentUser._id)
                            .catch(function (err) {
                                console.log(err);
                            });
            }]
        }
    });

});

app.controller('DiffsCtrl', function ($scope, MathUtils, Modal, Dashboard, allDiffsByUser, $modal, currentUser, $rootScope) {
    $rootScope.stateClass = 'diffs';
    $scope.alertsByDate = null;
    $scope.allDiffsByUser = allDiffsByUser;
    $scope.openDiffModal = Modal.openModal;

});


























