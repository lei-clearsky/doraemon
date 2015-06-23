'use strict';

app.factory('Config', function ($http) {

    return {
        getOne: function (id) {
            return $http.get('/api/test-config/' + id)
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
                        });
        },
        getConfigsByUserID: function (userID) {
            return $http.get('/api/test-config/' + userID)
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function(err) {
                            return err;
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
        }
    }
        // ,
        // get unique tests
    //     getUniqueTests: function (allTestsByUser) {
    //         var tests = [];
    //         var byTest = [];
    //         allTestsByUser.forEach(function(test, index) {
    //             var indexOfTest = tests.indexOf(test);
    //             if (indexOfTest < 0) {
    //                 tests.push({
    //                     name: test,
    //                     url: [{
    //                         name: test.URL,
    //                         viewport: [test.viewport],
    //                         day: [test.dayFrequency[0]],
    //                         time: [test.hourFrequency[0]]
    //                     }]
    //                 });
    //             } else {
    //                 tests[indexOfTest].url.forEach(function (url) {
    //                     var indexOfUrl = 
    //                     if ()
    //                 })
    //                 tests[index].url.push({
    //                     name: 
    //                 });
    //             }
    //         });
    //         return tests;
    //     },
    //     // construct display by test name obj
    //     constructByTestsObj: function (allTestsByUser, uniqueTests) {
    //         var byTest = [];
    //         allTestsByUser.forEach (function (test) {
    //             uniqueTests.forEach (function (unique) {
    //                 var
    //             });
    //         });

    //         tests.forEach(function(test, index) {
    //             var testObj = {
    //                 name: '',
    //                 url: []
    //             };
    //             testObj.name = test;
    //             testObj.url = [];
    //             if (te)

    //             byTest.push(d);
    //         });
    //         return byDate;
    //     },
    //     // construct display by date obj
    //     getByDateObj: function (allDiffsByUser, dates, byDateObj, MathUtils) {
    //         allDiffsByUser.forEach(function(diff) {
    //             dates.forEach(function (date, index) {
    //                 var diffCaptureTime = MathUtils.formatDate(diff.captureTime);
    //                 if (diffCaptureTime === date) {
    //                     byDateObj[index].date = date;
                       
    //                     if (diff.diffPercent*100 > diff.threshold) {
    //                         byDateObj[index].alerts.push(diff);
    //                     }

    //                     byDateObj[index].perc.push(diff.diffPercent);
    //                 }                            
    //             });
                
    //         });
    //         return byDateObj;
    //     }
    // };

});












