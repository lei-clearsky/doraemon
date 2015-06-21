'use strict';

app.factory('Dashboard', function ($http) {

    return {
        getOne: function (id) {
            return $http.get('/api/screenshots/' + id)
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });
        },
        getTestsByUserID: function (userID) {
            return $http.get('/api/screenshots/' + userID)
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });
        },
        searchDiffs: function (params) {
            return $http({
                url: '/api/screenshots/searchDiffs',
                method: 'GET',
                params: params
            }).then(function(res) {
                return res.data;
            }).catch(function(err) {
                console.log(err);
                return err;
            });
        },
        searchTestsByName: function (params) {
            return $http({
                url: '/api/screenshots/searchTestByName',
                method: 'GET',
                params: params
            }).then(function(res) {
                return res.data;
            }).catch(function(err) {
                console.log(err);
                return err;
            });
        },
        allDiffsByUser: function (userID) {

            return $http.get('/api/screenshots/allDiffs/' + userID)
                        .then(function (response) {
                            // console.log('diffs ', response.data);
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });
        },
        allScreenshotsForUser: function (userID) {
            return $http.get('/api/screenshots/allScreenshots/' + userID)
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });
        },
        getDiffsByUrl: function (params) {
            return $http({
                url: '/api/screenshots/diffsByUrl',
                method: 'GET',
                params: params
            })
            .then(function (response) {
                return response.data;
            })
            .catch(function (err) {
                return err;
            });
        },
        // get unique dates
        getUniqueDates: function (allDiffsByUser, MathUtils) {
            var dates = [];
            var days = [];
            var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            allDiffsByUser.forEach(function(diffImg, index) {
                var formattedDate = MathUtils.formatDate(diffImg.captureTime);
                if (dates.indexOf(formattedDate) < 0) {
                    var d = new Date(diffImg.captureTime);
                    var day = dayNames[ d.getDay() ];
                    dates.push(formattedDate);
                    days.push(day);
                }
            });
            return {
                dates: dates,
                days: days   
            };
        },
        // construct display by date base obj
        getByDateBaseObj: function (dates, days) {
            var byDate = [];
            dates.forEach(function(date, index) {
                var d = {
                    date: '',
                    day: '',
                    alerts: [],
                    testsRun: [],
                    perc: [],
                    lowestPerc: '',
                    highestPerc: '',
                    averagePerc: ''
                };
                d.date = date;
                d.day = days[index];
                byDate.push(d);
            });
            return byDate;
        },
        // construct display by date obj
        getByDateObj: function (allDiffsByUser, dates, byDateObj, MathUtils) {
            allDiffsByUser.forEach(function(diff) {
                dates.forEach(function (date, index) {
                    var diffCaptureTime = MathUtils.formatDate(diff.captureTime);
                    if (diffCaptureTime === date) {
                        byDateObj[index].date = date;
                       
                        if (diff.diffPercent*100 > diff.threshold) {
                            byDateObj[index].alerts.push(diff);
                        }

                        byDateObj[index].perc.push(diff.diffPercent);
                    }                            
                });
                
            });
            return byDateObj;
        }
    };

});












