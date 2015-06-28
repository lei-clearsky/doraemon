'use strict';

app.factory('Dashboard', function ($http) {
    var getUniqueDates = function (allDiffsByUser, MathUtils) {
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
    };
    // construct display by date base obj
    var getByDateBaseObj = function (dates, days) {
        var byDate = [];
        dates.forEach(function(date, index) {
            var d = {
                date: '',
                day: '',
                alerts: [],
                testsRun: [],
                perc: [],
                percObjArr: [],
                lowestPerc: '',
                highestPerc: '',
                averagePerc: ''
            };
            d.date = date;
            d.day = days[index];
            byDate.push(d);
        });
        return byDate;
    };
    // construct display by date obj
    var getByDateObj = function (allDiffsByUser, dates, byDateObj, MathUtils) {
        allDiffsByUser.forEach(function(diff) {
            dates.forEach(function (date, index) {
                var diffCaptureTime = MathUtils.formatDate(diff.captureTime);
                if (diffCaptureTime === date) {
                    byDateObj[index].date = date;
                   
                    if (diff.diffPercent*100 > diff.threshold) {
                        byDateObj[index].alerts.push(diff);
                    }

                    byDateObj[index].perc.push(diff.diffPercent);

                    if (diff.diffPercent*100 > 0)
                        byDateObj[index].percObjArr.push({
                            diffPercent: diff.diffPercent,
                            diffObj: diff
                        });
                }                            
            });
            
        });
        return byDateObj;
    };

    var displayByDate = function (allDiffsByUser, MathUtils) {
        var uniqueDatesObj = getUniqueDates(allDiffsByUser, MathUtils);
        var days = uniqueDatesObj.days;
        var dates = uniqueDatesObj.dates;
        var byDateObj = getByDateBaseObj(dates, days);
        byDateObj = getByDateObj(allDiffsByUser, dates, byDateObj, MathUtils);

        byDateObj.forEach(function (el) {
            var percArr = el.perc;
            el.lowestPerc = MathUtils.getLowestPerc(percArr);
            el.highestPerc = MathUtils.getHighestPerc(percArr);
            el.averagePerc = MathUtils.calcAveragePerc(percArr);
        });
        return byDateObj;
    };

    var getStatsOneTest = function (diffsOneTest, MathUtils) {
        var alertsOneTest = [];
        var diffPercentArr = [];
        var percObjArr = [];
        diffsOneTest.forEach(function(diff, index) {
            if (diff.diffPercent*100 > diff.threshold) {
                alertsOneTest.push(diff);
            }
            diffPercentArr.push(diff.diffPercent);
            if (diff.diffPercent*100 > 0) 
                percObjArr.push({index:diff.diffPercent});
        });
        return {
            alerts: alertsOneTest.length,
            percObjArr: percObjArr,
            diffPerc: {
                averagePerc: MathUtils.calcAveragePerc(diffPercentArr),
                highestPerc: MathUtils.getHighestPerc(diffPercentArr),
                lowestPerc: MathUtils.getLowestPerc(diffPercentArr)
            }
        }
    }

    return {
        getOne: function (id) {
            return $http.get('/api/screenshots/' + id)
                        .then(function (response) {
                            return response.data;
                        });
        },
        getTestsByUserID: function (userID) {
            return $http.get('/api/screenshots/' + userID)
                        .then(function (response) {
                            return response.data;
                        });
        },
        getUniqueTests: function (allTestsByUser) {
            var tests = [];
            allTestsByUser.forEach(function (test, index) {
                if (tests.indexOf(test.name) === -1) {
                    tests.push(test.name);
                }
            });
            return tests;
        },
        searchDiffs: function (params) {
            return $http({
                url: '/api/screenshots/searchDiffs',
                method: 'GET',
                params: params
            }).then(function(res) {
                return res.data;
            });
        },
        searchDiffsByTest: function (params) {
            return $http({
                url: '/api/screenshots/searchDiffsByTest',
                method: 'GET',
                params: params
            }).then(function(res) {
                return res.data;
            });
        },
        searchTestsByName: function (params) {
            return $http({
                url: '/api/screenshots/searchTestByName',
                method: 'GET',
                params: params
            }).then(function(res) {
                return res.data;
            });
        },
        allDiffsByUser: function (userID) {
            return $http.get('/api/screenshots/allDiffs/' + userID)
                        .then(function (response) {
                            return response.data;
                        });
        },
        allScreenshotsForUser: function (userID) {
            return $http.get('/api/screenshots/allScreenshots/' + userID)
                        .then(function (response) {
                            return response.data;
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
            });
        },
        // get tests ran today
        getTestsToday: function (allDiffsByUser, MathUtils) {
            var testsToday = 0;
            var today = new Date();
            var formattedToday = MathUtils.formatDate(today);
            allDiffsByUser.forEach(function(diffImg, index){
                var formattedDate = MathUtils.formatDate(diffImg.captureTime);
                if (formattedDate === formattedToday) {
                    testsToday ++;
                }
            });
            return testsToday;
        },
        // get today's alerts and diff percent
        getStatsToday: function (testsByDate, MathUtils) {
            var today = new Date();
            // var formattedToday = MathUtils.formatDate(today);
            var formattedToday = '2015-06-20';
            if (testsByDate[0] !== undefined && testsByDate[0].date === formattedToday) {
                return {
                    alertsToday: testsByDate[0].alerts.length,
                    diffPercentToday: testsByDate[0]
                }
            }
            else {
                return {
                    alertsToday: 0,
                    diffPercentToday: {
                                        averagePerc: 0,
                                        highestPerc: 0,
                                        lowestPerc: 0
                                        }
                };
            }
        },

        displayByDate: displayByDate,
        getStatsOneTest: getStatsOneTest,

        // display by viewport
        displayByViewport: function (diffsForUserByTest) {
            var viewports = [];
            var byViewports = [];
            // get unique urls 
            diffsForUserByTest.forEach(function(diff, index) {
                if (viewports.indexOf(diff.viewport) === -1) {
                    viewports.push(diff.viewport);
                    byViewports.push({
                        viewport: diff.viewport,
                        images: []
                    });
                }
            });
            // display diffs by unique viewports
            diffsForUserByTest.forEach(function(diff) {
                var viewportsIndex = viewports.indexOf(diff.viewport);
                byViewports[viewportsIndex].images.push(diff);
            })
            return byViewports;
        },
            // display by URL
        displayByURL: function (diffsForUserByTest) {
            var urls = [];
            var byUrls = [];
            // get unique urls 
            diffsForUserByTest.forEach(function(diff, index) {
                if (urls.indexOf(diff.websiteUrl) === -1) {
                    urls.push(diff.websiteUrl);
                    byUrls.push({
                        urlName: diff.websiteUrl,
                        images: []
                    });
                }
            });
            // display diffs by unique urls
            diffsForUserByTest.forEach(function(diff) {
                var urlsIndex = urls.indexOf(diff.websiteUrl);
                byUrls[urlsIndex].images.push(diff);
            });
            return byUrls;
        }
    };

});












