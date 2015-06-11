app.factory('SignUpFactory', function ($http) {

    return {
        signupNewUser: function (signupObject) {
            return  $http.post('/api/users', signupObject)
                        .then(function(response) {
                        return response.data;
                    }).catch(function(err) {
                        console.error(err);
                        return err;
                    });
        }
    };

});