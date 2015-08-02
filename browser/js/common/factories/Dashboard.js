'use strict';

app.factory('Dashboard', function ($http) {
    var getOne = function (id) {
        return $http.get('/api/screenshots/' + id)
                    .then(function (response) {
                        return response.data;
                    });
    };

    var getTests = function (userID) {
        return $http.get('api/test-config/getTests/' + userID)
                .then(function (response) {
                    return response.data;
                });
    };

    var getTestsByUserID = function (userID) {
        return $http.get('/api/screenshots/' + userID)
                    .then(function (response) {
                        return response.data;
                    });
    };
    var getUniqueTests = function (allTestsByUser) {
        var tests = [];
        allTestsByUser.forEach(function (test, index) {
            if (tests.indexOf(test.name) === -1) {
                tests.push(test.name);
            }
        });
        return tests;
    };
    var searchDiffs = function (params) {
        return $http({
            url: '/api/screenshots/searchDiffs',
            method: 'GET',
            params: params
        }).then(function(res) {
            return res.data;
        });
    };
    var searchDiffsByTest = function (params) {
        return $http({
            url: '/api/screenshots/searchDiffsByTest',
            method: 'GET',
            params: params
        }).then(function(res) {
            return res.data;
        });
    };
    var searchTestsByName = function (params) {
        return $http({
            url: '/api/screenshots/searchTestByName',
            method: 'GET',
            params: params
        }).then(function(res) {
            return res.data;
        });
    };
    var allDiffsByUser = function (userID) {
        return $http.get('/api/screenshots/allDiffs/' + userID)
                    .then(function (response) {
                        return response.data;
                    });
    };
    var allScreenshotsForUser = function (userID) {
        return $http.get('/api/screenshots/allScreenshots/' + userID)
                    .then(function (response) {
                        return response.data;
                    });
    };
    var getDiffsByUrl = function (params) {
        return $http({
            url: '/api/screenshots/diffsByUrl',
            method: 'GET',
            params: params
        })
        .then(function (response) {
            return response.data;
        });
    };
    // get tests ran today
    var getTestsToday = function (allDiffsByUser, MathUtils) {
        var testsToday = 0;
        var today = new Date();
        var formattedToday = MathUtils.formatDate(today);
        // var formattedToday = '2015-07-08';
        allDiffsByUser.forEach(function(diffImg, index){
            var formattedDate = MathUtils.formatDate(diffImg.captureTime);
            if (formattedDate === formattedToday) {
                testsToday ++;
            }
        });
        return testsToday;
    };
    // get today's alerts and diff percent
    var getStatsToday = function (testsByDate, MathUtils) {
        var today = new Date();
        var formattedToday = MathUtils.formatDate(today);
        // var formattedToday = '2015-07-08';
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
    };
    // get all alert numbers
    var getTotalAlerts = function (allDiffsByUser) {
        var alertNum = 0;
        allDiffsByUser.forEach(function (diff) {
            if (diff.diffPercent*100 > diff.threshold) 
                alertNum++;
        });
        return alertNum;
    };
    var getUniqueDates = function (allDiffsByUser, MathUtils) {
        var dates = [];
        var days = [];
        var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        allDiffsByUser.forEach(function(diffImg, index) {
            var formattedDate = MathUtils.formatDate(diffImg.captureTime);
            if (dates.indexOf(formattedDate) < 0) {
                var d = new Date(diffImg.captureTime);
                var day = dayNames[ d.getDay() ];
                dates.splice(0, 0, formattedDate);
                days.splice(0, 0, day);
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
                    byDateObj[index].testsRun.push(diff);
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
                percObjArr.push({
                    diffPercent:diff.diffPercent,
                    diffObj: diff
                    });
        });
        return {
            alerts: alertsOneTest.length,
            percObjArr: percObjArr,
            diffPerc: {
                averagePerc: diffPercentArr.length > 0 ? MathUtils.calcAveragePerc(diffPercentArr) : 0,
                highestPerc: diffPercentArr.length > 0 ? MathUtils.getHighestPerc(diffPercentArr) : 0,
                lowestPerc: diffPercentArr.length > 0 ? MathUtils.getLowestPerc(diffPercentArr) : 0
            }
        }
    };
    // display by viewport
    var displayByViewport = function (diffsForUserByTest) {
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
    };
    // display by URL
    var displayByURL = function (diffsForUserByTest) {
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
    };

    return {

        // get one diff
        // getOne: getOne,
        // search diffs by search params
        // searchDiffs: searchDiffs,
        // get all tests by user id
        getTestsByUserID: getTestsByUserID,
        // get unique tests
        getUniqueTests: getUniqueTests,
        // search diffs by test name
        searchDiffsByTest: searchDiffsByTest,
        // search tests by test name
        searchTestsByName: searchTestsByName,
        // get all diffs by user id
        allDiffsByUser: allDiffsByUser,
        // get all screenshots by user id
        allScreenshotsForUser: allScreenshotsForUser,
        // get diffs by url
        getDiffsByUrl: getDiffsByUrl,
        // get tests json object
        getTests: getTests,
        // get tests ran today
        getTestsToday: getTestsToday,
        // get today's alerts and diff percent
        getStatsToday: getStatsToday,
        // get total Alerts
        getTotalAlerts: getTotalAlerts,
        // get one test's stats
        getStatsOneTest: getStatsOneTest,
        // display diffs by date
        displayByDate: displayByDate,
        // display by viewport
        displayByViewport: displayByViewport,
        // display by URL
        displayByURL: displayByURL
    };

});












