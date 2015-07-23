var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var mongoose = require('mongoose');

require('../../../server/db/models/user');
require('../../../server/db/models/image-capture');
require('../../../server/db/models/image-diff');
require('../../../server/db/models/test-config');

var User = mongoose.model('User');
var TestConfig = mongoose.model('TestConfig');

describe('TestConfig model', function () {
    beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) 
            return done();
        mongoose.connect(dbURI, done);
    });

    afterEach('Clear test database', function (done) {
        clearDB(done);
    });

    it('should exist', function () {
        expect(TestConfig).to.be.a('function');
    });

    describe('TestConfig.create method', function () {

        it('should return a new testConfig document', function () {

            var userID;
            var obj = {
                email: 'test@fsa.com',
                password: 'test'
            };

            return User.create(obj).then(function(user) {
                userID = user._id;
                var obj1 = {
                    name: 'Test 1',
                    URL: 'https://www.google.com/',
                    viewport: '1024x768',
                    dayFrequency: [0],
                    hourFrequency: [0],
                    userID: user._id,
                    teamID: null
                };

                return TestConfig.create(obj1);
            }).then(function(data) {
                expect(data).to.have.deep.property('name','Test 1');
                expect(data).to.have.deep.property('URL','https://www.google.com/');
                expect(data).to.have.deep.property('viewport','1024x768');
                expect(data.dayFrequency).to.have.members([0]);
                expect(data.hourFrequency).to.have.members([0]);
                expect(data.viewportWidth).to.be.equal(1024);
                expect(data.viewportHeight).to.be.equal(768);
                expect(data).to.have.deep.property('userID',userID);
                expect(data).to.have.deep.property('teamID',null);
                expect(data).to.have.deep.property('enabled',false);
                expect(data).to.have.deep.property('testStepIndex',-1);
                expect(data).to.have.deep.property('threshold',10);
            }); 
        });

        it('should return multiple new testConfig documents', function () {
            
            var obj = {
                email: 'test@fsa.com',
                password: 'test'
            };

            return User.create(obj).then(function(user) {
                var obj1 = {
                    name: 'Test 1',
                    URL: 'https://www.google.com/',
                    viewport: '1024x768',
                    dayFrequency: [0],
                    hourFrequency: [0],
                    userID: user._id,
                    teamID: null
                };

                var obj2 = {
                    name: 'Test 2',
                    URL: 'https://www.yahoo.com/',
                    viewport: '1024x768',
                    dayFrequency: [1],
                    hourFrequency: [1],
                    userID: user._id,
                    teamID: null
                };

                var obj3 = {
                    name: 'Test 3',
                    URL: 'https://www.bing.com/',
                    viewport: '1024x768',
                    dayFrequency: [2],
                    hourFrequency: [2],
                    userID: user._id,
                    teamID: null
                };

                return TestConfig.create([obj1, obj2, obj3]);
            }).then(function() {
                return TestConfig.find({}).exec().then(function(data) {
                    expect(data).to.have.length(3);
                });
            }); 
        });

        it('should NOT return a new testConfig document (no userID, viewport, URL, or name)', function () {
                
            var obj1 = {
                dayFrequency: [0],
                hourFrequency: [0],
                teamID: null,
                threshold: 10,
                steps: []
            };

            return TestConfig.create(obj1).then(function(data) {
                throw new Error("Test Failed - No Validation Error Thrown");
            }).then(null, function(data) {
                expect(data.name).to.be.equal("ValidationError");                
                expect(data.errors).to.contain.all.keys(['userID', 'viewport', 'URL', 'name']);
            });
        });
    });

    describe('Scheduled UI Tests', function() {

        describe('findAllScheduledTests method', function () {

            it('should exist', function () {
                expect(TestConfig.findAllScheduledTests).to.be.a('function');
            });

            it('should return a empty array', function () {
                return TestConfig.findAllScheduledTests().then(function(data) {
                    expect(data.length).to.be.equal(0);
                });
            });

            it('should return a testConfig document', function () {

                var userID;
                var obj = {
                    email: 'test@fsa.com',
                    password: 'test'
                };

                return User.create(obj).then(function(user) {
                    userID = user._id;
                    var obj = {
                        name: 'Test Google',
                        URL: 'https://www.google.com/',
                        viewport: '1024x768',
                        dayFrequency: [0,4],
                        hourFrequency: [0,5],
                        userID: user._id,
                        teamID: null
                    };

                    return TestConfig.create(obj);
                }).then(function(data) {
                    return TestConfig.findAllScheduledTests(0,0);
                }).then(function(data) {
                    expect(data).to.have.length(1);
                    expect(data[0]).to.have.deep.property('name','Test Google');
                    expect(data[0]).to.have.deep.property('URL','https://www.google.com/');
                    expect(data[0]).to.have.deep.property('viewport','1024x768');
                    expect(data[0].dayFrequency).to.include.members([4]);
                    expect(data[0].hourFrequency).to.include.members([5]);
                    expect(data[0].viewportWidth).to.be.equal(1024);
                    expect(data[0].viewportHeight).to.be.equal(768);
                    expect(data[0].userID.toString()).to.be.equal(userID.toString());

                    // expect(data[0]).to.have.deep.property('userID', userID); // this fails but I have no idea why
                    expect(data[0]).to.have.deep.property('teamID', null);
                }); 
            });

            it('findAllScheduledTests should return multiple testConfig documents', function () {

                var obj = {
                    email: 'test@fsa.com',
                    password: 'test'
                };

                return User.create(obj).then(function(user) {

                    var obj1 = {
                        name: 'Test Google 1',
                        URL: 'https://www.google.com/',
                        viewport: '1024x768',
                        dayFrequency: [0],
                        hourFrequency: [0],
                        userID: user._id,
                        teamID: null
                    };

                    var obj2 = {
                        name: 'Test Google 2',
                        URL: 'https://www.google.com/',
                        viewport: '1024x768',
                        dayFrequency: [1],
                        hourFrequency: [0],
                        userID: user._id,
                        teamID: null
                    };

                    var obj3 = {
                        name: 'Test Google 3',
                        URL: 'https://www.google.com/',
                        viewport: '1024x768',
                        dayFrequency: [0,2,4],
                        hourFrequency: [0,10,16],
                        userID: user._id,
                        teamID: null
                    };

                    var obj4 = {
                        name: 'Test Google 4',
                        URL: 'https://www.google.com/',
                        viewport: '1024x768',
                        dayFrequency: [0],
                        hourFrequency: [1],
                        userID: user._id,
                        teamID: null
                    };

                    var obj5 = {
                        name: 'Test Google 5',
                        URL: 'https://www.google.com/',
                        viewport: '1024x768',
                        dayFrequency: [1],
                        hourFrequency: [1],
                        userID: user._id,
                        teamID: null
                    };

                    return TestConfig.create([obj1, obj2, obj3, obj4, obj5]);
                }).then(function(data) {
                    return TestConfig.findAllScheduledTests(0,0);
                }).then(function(data) {
                    expect(data).to.have.length(2);
                    expect(data[0].dayFrequency).to.include.members([0]);
                    expect(data[0].hourFrequency).to.include.members([0]);
                    expect(data[1].dayFrequency).to.include.members([0]);
                    expect(data[1].hourFrequency).to.include.members([0]);
                }); 
            });

            it('getSharedConfigs should return a testConfig document', function () {
                var userID1, userID2;
                var obj1 = {
                    email: 'test@fsa.com',
                    password: 'test'
                };

                var obj2 = {
                    email: 'test2@fsa.com',
                    password: 'test2'
                };

                return User.create([obj1,obj2]).then(function(users) {
                    userID1 = users[0]._id;
                    userID2 = users[1]._id;

                    var obj1 = {
                        name: 'Test Google',
                        URL: 'https://www.google.com/',
                        viewport: '1024x768',
                        dayFrequency: [0],
                        hourFrequency: [0],
                        userID: userID1,
                        teamID: null,
                        threshold: 20
                    };

                    var obj2 = {
                        name: 'Test Yahoo',
                        URL: 'https://www.yahoo.com/',
                        viewport: '1024x768',
                        dayFrequency: [1],
                        hourFrequency: [0],
                        userID: userID1,
                        teamID: null
                    };

                    var obj3 = {
                        name: 'Test Amazon',
                        URL: 'https://www.amazon.com/',
                        viewport: '1024x768',
                        dayFrequency: [0,2,4],
                        hourFrequency: [0,10,16],
                        userID: userID2,
                        teamID: null
                    };

                    var obj4 = {
                        name: 'Test Facebook',
                        URL: 'https://www.facebook.com/',
                        viewport: '1024x768',
                        dayFrequency: [0],
                        hourFrequency: [1],
                        userID: userID2,
                        teamID: null
                    };

                    var obj5 = {
                        name: 'Test Twitter',
                        URL: 'https://www.twitter.com/',
                        viewport: '1024x768',
                        dayFrequency: [1],
                        hourFrequency: [1],
                        userID: userID2,
                        teamID: null,
                        enabled: false
                    };

                    return TestConfig.create([obj1, obj2, obj3, obj4, obj5]);
                }).then(function(data) {
                    return TestConfig.getSharedConfigs(userID1, 'Test Google', 'https://www.google.com/');
                }).then(function(data) {
                    expect(data).to.have.deep.property('enabled', false);
                    expect(data.hourFrequency).to.include.members([0]);
                    expect(data.dayFrequency).to.include.members([0]);
                    expect(data).to.have.deep.property('threshold', 20);

                    return TestConfig.getSharedConfigs(userID2, 'Test Google', 'https://www.google.com/');
                }).then(function(data) {
                    expect(data).to.be.null;
                });
            });

            it('getViewportsForURL should return a testConfig documents', function () {
                var userID1, userID2;
                var obj1 = {
                    email: 'test@fsa.com',
                    password: 'test'
                };

                var obj2 = {
                    email: 'test2@fsa.com',
                    password: 'test2'
                };

                return User.create([obj1,obj2]).then(function(users) {
                    userID1 = users[0]._id;
                    userID2 = users[1]._id;

                    var obj1 = {
                        name: 'Test Google',
                        URL: 'https://www.google.com/',
                        viewport: '1024x768',
                        dayFrequency: [0],
                        hourFrequency: [0],
                        userID: userID1,
                        teamID: null,
                        threshold: 20
                    };

                    var obj2 = {
                        name: 'Test Yahoo',
                        URL: 'https://www.yahoo.com/',
                        viewport: '1024x768',
                        dayFrequency: [1],
                        hourFrequency: [0],
                        userID: userID1,
                        teamID: null
                    };

                    var obj3 = {
                        name: 'Test Amazon',
                        URL: 'https://www.amazon.com/',
                        viewport: '1024x768',
                        dayFrequency: [0,2,4],
                        hourFrequency: [0,10,16],
                        userID: userID2,
                        teamID: null
                    };

                    var obj4 = {
                        name: 'Test Facebook',
                        URL: 'https://www.facebook.com/',
                        viewport: '1024x768',
                        dayFrequency: [0],
                        hourFrequency: [1],
                        userID: userID2,
                        teamID: null
                    };

                    var obj5 = {
                        name: 'Test Twitter',
                        URL: 'https://www.twitter.com/',
                        viewport: '1024x768',
                        dayFrequency: [1],
                        hourFrequency: [1],
                        userID: userID2,
                        teamID: null,
                        enabled: false
                    };

                    return TestConfig.create([obj1, obj2, obj3, obj4, obj5]);
                }).then(function(data) {
                    return TestConfig.getViewportsForURL(userID1, 'Test Google', 'https://www.google.com/');
                }).then(function(data) {
                    expect(data).to.have.length(1);
                    expect(data).to.include.members(['1024x768']);
                    return TestConfig.getViewportsForURL(userID2, 'Test Google', 'https://www.google.com/');
                }).then(function(data) {
                    expect(data).to.have.length(0);
                });
            });

        });
    });
});