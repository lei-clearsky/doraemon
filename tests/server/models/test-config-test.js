var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var mongoose = require('mongoose');
var Nightmare = require('nightmare');

require('../../../server/db/models/user');
require('../../../server/db/models/image-capture');
require('../../../server/db/models/image-diff');
require('../../../server/db/models/test-config');

var User = mongoose.model('User');
var TestConfig = mongoose.model('TestConfig');
var ImageDiff = mongoose.model('ImageDiff');
var ImageCapture = mongoose.model('ImageCapture');

describe('TestConfig model', function () {
    var user1, user2, user3;

    beforeEach('Establish DB connection', function (done) {
        if (!mongoose.connection.db) 
            mongoose.connect(dbURI);

        var obj1 = {
            email: 'test@fsa.com',
            password: 'test'
        };

        var obj2 = {
            email: 'test2@fsa.com',
            password: 'test2'
        };

        var obj3 = {
            email: 'test3@fsa.com',
            password: 'test3'
        };

        return User.create([obj1, obj2, obj3]).then(function(users) {
            user1 = users[0];
            user2 = users[1];
            user3 = users[2];
            return done();
        });
    });

    afterEach('Clear test database', function (done) {
        clearDB(done);
    });

    it('should exist', function () {
        expect(TestConfig).to.be.a('function');
    });

    describe('TestConfig.create method', function () {

        it('should return a new testConfig document', function () {

            var obj1 = {
                name: 'Test 1',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: user1._id
            };

            return TestConfig.create(obj1).then(function(data) {
                expect(data).to.have.deep.property('name','Test 1');
                expect(data).to.have.deep.property('URL','https://www.google.com/');
                expect(data).to.have.deep.property('viewport','1024x768');
                expect(data.dayFrequency).to.have.members([0]);
                expect(data.hourFrequency).to.have.members([0]);
                expect(data.viewportWidth).to.be.equal(1024);
                expect(data.viewportHeight).to.be.equal(768);
                expect(data).to.have.deep.property('userID',user1._id);
                expect(data).to.have.deep.property('enabled',false);
                expect(data).to.have.deep.property('testStepIndex',-1);
                expect(data).to.have.deep.property('threshold',10);
            }); 
        });

        it('should return multiple new testConfig documents', function () {
            
            var obj1 = {
                name: 'Test 1',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: user1._id
            };

            var obj2 = {
                name: 'Test 2',
                URL: 'https://www.yahoo.com/',
                viewport: '1024x768',
                dayFrequency: [1],
                hourFrequency: [1],
                userID: user1._id
            };

            var obj3 = {
                name: 'Test 3',
                URL: 'https://www.bing.com/',
                viewport: '1024x768',
                dayFrequency: [2],
                hourFrequency: [2],
                userID: user1._id
            };

            return TestConfig.create([obj1, obj2, obj3]).then(function() {
                return TestConfig.find({}).exec();
            }).then(function(data) {
                expect(data).to.have.length(3);
            });; 
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

    describe('TestConfig method tests', function() {
        
        it('getViewportsForURL should return testConfig documents', function () {

            var obj1 = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: user1._id,
                threshold: 20
            };

            var obj2 = {
                name: 'Test Yahoo',
                URL: 'https://www.yahoo.com/',
                viewport: '1024x768',
                dayFrequency: [1],
                hourFrequency: [0],
                userID: user1._id
            };

            var obj3 = {
                name: 'Test Amazon',
                URL: 'https://www.amazon.com/',
                viewport: '1024x768',
                dayFrequency: [0,2,4],
                hourFrequency: [0,10,16],
                userID: user2._id
            };

            var obj4 = {
                name: 'Test Facebook',
                URL: 'https://www.facebook.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [1],
                userID: user2._id
            };

            var obj5 = {
                name: 'Test Twitter',
                URL: 'https://www.twitter.com/',
                viewport: '1024x768',
                dayFrequency: [1],
                hourFrequency: [1],
                userID: user2._id,
                enabled: false
            };

            return TestConfig.create([obj1, obj2, obj3, obj4, obj5]).then(function(data) {
                return TestConfig.getViewportsForURL(user1._id, 'Test Google', 'https://www.google.com/');
            }).then(function(data) {
                expect(data).to.have.length(1);
                expect(data).to.include.members(['1024x768']);
                return TestConfig.getViewportsForURL(user2._id, 'Test Google', 'https://www.google.com/');
            }).then(function(data) {
                expect(data).to.have.length(0);
            });
        });

        it('getURLsForTest should return urls', function () {

            var obj1 = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: user1._id,
                threshold: 20
            };

            var obj2 = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                viewport: '640x420',
                dayFrequency: [1],
                hourFrequency: [0],
                userID: user1._id
            };

            var obj3 = {
                name: 'Test Google',
                URL: 'https://www.google.com/mail',
                viewport: '640x420',
                dayFrequency: [0,2,4],
                hourFrequency: [0,10,16],
                userID: user1._id
            };

            var obj4 = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [1],
                userID: user2._id
            };

            var obj5 = {
                name: 'Test Google',
                URL: 'https://www.google.com/maps',
                viewport: '1024x768',
                dayFrequency: [1],
                hourFrequency: [1],
                userID: user2._id,
                enabled: false
            };

            return TestConfig.create([obj1, obj2, obj3, obj4, obj5]).then(function(data) {
                return TestConfig.getURLsForTest(user1._id, 'Test Google');
            }).then(function(data) {
                expect(data).to.have.length(2);
                expect(data).to.include.members([ 'https://www.google.com/', 'https://www.google.com/mail' ]);
                return TestConfig.getURLsForTest(user2._id, 'Test Yahoo');
            }).then(function(data) {
                expect(data).to.have.length(0);
                return TestConfig.getURLsForTest(user1._id, 'Test Yahoo');
            }).then(function(data) {
                expect(data).to.have.length(0);
            });;
        });

        it('getTestNamesForUser should return test names', function () {

            var obj1 = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: user1._id,
                threshold: 20
            };

            var obj2 = {
                name: 'Test Google',
                URL: 'https://www.google.com/mail',
                viewport: '640x420',
                dayFrequency: [1],
                hourFrequency: [0],
                userID: user1._id
            };

            var obj3 = {
                name: 'Test Yahoo',
                URL: 'https://www.yahoo.com/mail',
                viewport: '640x420',
                dayFrequency: [0,2,4],
                hourFrequency: [0,10,16],
                userID: user1._id
            };

            var obj4 = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [1],
                userID: user2._id
            };

            var obj5 = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                viewport: '640x420',
                dayFrequency: [1],
                hourFrequency: [1],
                userID: user2._id,
                enabled: false
            };

            return TestConfig.create([obj1, obj2, obj3, obj4, obj5]).then(function(data) {
                return TestConfig.getTestNamesForUser(user1._id);
            }).then(function(data) {
                expect(data).to.have.length(2);
                expect(data).to.include.members(['Test Google', 'Test Yahoo']);
                return TestConfig.getTestNamesForUser(user2._id);
            }).then(function(data) {
                expect(data).to.have.length(1);
                expect(data).to.include.members(['Test Google']);
                return TestConfig.getTestNamesForUser(user3._id);
            }).then(function(data) {
                expect(data).to.have.length(0);
            });
        });

        it('getTestNameRootURL should return an object', function () {

            var obj1 = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                rootURL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: user1._id,
                threshold: 20
            };

            var obj2 = {
                name: 'Test Google',
                URL: 'https://www.google.com/mail',
                rootURL: 'https://www.google.com/',
                viewport: '640x420',
                dayFrequency: [1],
                hourFrequency: [0],
                userID: user1._id
            };

            var obj3 = {
                name: 'Test Yahoo',
                URL: 'https://www.yahoo.com/mail',
                rootURL: 'https://www.yahoo.com/',
                viewport: '640x420',
                dayFrequency: [0,2,4],
                hourFrequency: [0,10,16],
                userID: user1._id
            };

            var obj4 = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                rootURL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [1],
                userID: user2._id
            };

            var obj5 = {
                name: 'Test Google',
                URL: 'https://www.google.com/docs',
                rootURL: 'https://www.google.com/',
                viewport: '640x420',
                dayFrequency: [1],
                hourFrequency: [1],
                userID: user2._id,
                enabled: false
            };

            return TestConfig.create([obj1, obj2, obj3, obj4, obj5]).then(function(data) {
                return TestConfig.getTestNameRootURL(user1._id, 'Test Google');
            }).then(function(data) {
                expect(data).to.have.deep.property('name', 'Test Google');
                expect(data).to.have.deep.property('rootURL', 'https://www.google.com/');
                expect(data).to.have.deep.property('_id', data._id);
                return TestConfig.getTestNameRootURL(user2._id, 'Test Google');
            }).then(function(data) {
                expect(data).to.have.deep.property('name', 'Test Google');
                expect(data).to.have.deep.property('rootURL', 'https://www.google.com/');
                expect(data).to.have.deep.property('_id', data._id);
                return TestConfig.getTestNameRootURL(user3._id, 'Test Google');
            }).then(function(data) {
                expect(data).to.be.null;
            });
        });

        it('getSharedConfigs should return a testConfig document', function () {

            var obj1 = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: user1._id,
                threshold: 20
            };

            var obj2 = {
                name: 'Test Yahoo',
                URL: 'https://www.yahoo.com/',
                viewport: '1024x768',
                dayFrequency: [1],
                hourFrequency: [0],
                userID: user1._id
            };

            var obj3 = {
                name: 'Test Amazon',
                URL: 'https://www.amazon.com/',
                viewport: '1024x768',
                dayFrequency: [0,2,4],
                hourFrequency: [0,10,16],
                userID: user2._id
            };

            var obj4 = {
                name: 'Test Facebook',
                URL: 'https://www.facebook.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [1],
                userID: user2._id
            };

            var obj5 = {
                name: 'Test Twitter',
                URL: 'https://www.twitter.com/',
                viewport: '1024x768',
                dayFrequency: [1],
                hourFrequency: [1],
                userID: user2._id,
                enabled: false
            };

            return TestConfig.create([obj1, obj2, obj3, obj4, obj5]).then(function(data) {
                return TestConfig.getSharedConfigs(user1._id, 'Test Google', 'https://www.google.com/');
            }).then(function(data) {
                expect(data).to.have.deep.property('enabled', false);
                expect(data.hourFrequency).to.include.members([0]);
                expect(data.dayFrequency).to.include.members([0]);
                expect(data).to.have.deep.property('threshold', 20);

                return TestConfig.getSharedConfigs(user2._id, 'Test Google', 'https://www.google.com/');
            }).then(function(data) {
                expect(data).to.be.null;
            });
        });

        it('getDiffsByDate should return ImageDiffs documents', function () {
            var date1 = new Date('June 13, 2015 10:00:00');
            var date2 = new Date('June 14, 2015 10:00:00');
            var date3 = new Date('June 15, 2015 10:00:00');

            var obj1 = {
                captureTime: date1,
                testName: 'Test Google',
                userID: user1._id
            };

            var obj2 = {
                captureTime: date1,
                testName: 'Test Google',
                userID: user1._id
            };

            var obj3 = {
                captureTime: date1,
                testName: 'Test Google 2',
                userID: user1._id
            };

            var obj4 = {
                captureTime: date2,
                testName: 'Test Google',
                userID: user2._id
            };

            var obj5 = {
                captureTime: date2,
                testName: 'Test Google',
                userID: user2._id
            };

            return ImageDiff.create([obj1, obj2, obj3, obj4, obj5]).then(function(data) {
                return TestConfig.getDiffsByDate(date1, user1._id, 'Test Google');
            }).then(function(data) {
                expect(data).to.have.length(2);
                expect(data[0].userID.toString()).to.be.equal(user1._id.toString());
                expect(data[0]).to.have.deep.property('testName', 'Test Google');
                expect(data[1].userID.toString()).to.be.equal(user1._id.toString());
                expect(data[1]).to.have.deep.property('testName', 'Test Google');
                return TestConfig.getDiffsByDate(date1, user1._id);
            }).then(function(data) {
                expect(data).to.have.length(3);
                expect(data[0].userID.toString()).to.be.equal(user1._id.toString());
                expect(data[1].userID.toString()).to.be.equal(user1._id.toString());
                expect(data[2].userID.toString()).to.be.equal(user1._id.toString());
                return TestConfig.getDiffsByDate(date2, user1._id, 'Test Google');
            }).then(function(data) {
                expect(data).to.have.length(0);
            });
        });

        it('getDiffsByUrl should return ImageDiffs documents', function () {
            var date1 = new Date('June 13, 2015 10:00:00');
            var date2 = new Date('June 14, 2015 10:00:00');
            var date3 = new Date('June 15, 2015 10:00:00');
            var url1 = 'https://www.google.com/';
            var url2 = 'https://www.google.com/mail';


            var obj1 = {
                captureTime: date1,
                testName: 'Test Google',
                userID: user1._id,
                websiteUrl: url1
            };

            var obj2 = {
                captureTime: date1,
                testName: 'Test Google',
                userID: user1._id,
                websiteUrl: url1
            };

            var obj3 = {
                captureTime: date1,
                testName: 'Test Google 2',
                userID: user1._id,
                websiteUrl: url2
            };

            var obj4 = {
                captureTime: date2,
                testName: 'Test Google',
                userID: user2._id,
                websiteUrl: url2
            };

            var obj5 = {
                captureTime: date2,
                testName: 'Test Google 2',
                userID: user2._id,
                websiteUrl: url2
            };

            return ImageDiff.create([obj1, obj2, obj3, obj4, obj5]).then(function(data) {
                return TestConfig.getDiffsByUrl(url1, user1._id, 'Test Google');
            }).then(function(data) {
                expect(data).to.have.length(2);
                expect(data[0].userID.toString()).to.be.equal(user1._id.toString());
                expect(data[0]).to.have.deep.property('testName', 'Test Google');
                expect(data[0]).to.have.deep.property('websiteUrl', url1);
                expect(data[1].userID.toString()).to.be.equal(user1._id.toString());
                expect(data[1]).to.have.deep.property('testName', 'Test Google');
                expect(data[1]).to.have.deep.property('websiteUrl', url1);
                return TestConfig.getDiffsByUrl(url2, user2._id);
            }).then(function(data) {
                expect(data).to.have.length(2);
                expect(data[0].userID.toString()).to.be.equal(user2._id.toString());
                expect(data[0]).to.have.deep.property('websiteUrl', url2);
                expect(data[1].userID.toString()).to.be.equal(user2._id.toString());
                expect(data[1]).to.have.deep.property('websiteUrl', url2);
                return TestConfig.getDiffsByUrl(url1, user2._id);
            }).then(function(data) {
                expect(data).to.have.length(0);
            });
        });

        it('getDiffsByViewport should return ImageDiffs documents', function () {
            var date1 = new Date('June 13, 2015 10:00:00');
            var date2 = new Date('June 14, 2015 10:00:00');
            var date3 = new Date('June 15, 2015 10:00:00');
            var viewport1 = '1024x768';
            var viewport2 = '640x420';

            var obj1 = {
                captureTime: date1,
                testName: 'Test Google',
                userID: user1._id,
                viewport: viewport1
            };

            var obj2 = {
                captureTime: date1,
                testName: 'Test Google',
                userID: user1._id,
                viewport: viewport1
            };

            var obj3 = {
                captureTime: date1,
                testName: 'Test Google 2',
                userID: user1._id,
                viewport: viewport2
            };

            var obj4 = {
                captureTime: date2,
                testName: 'Test Google',
                userID: user2._id,
                viewport: viewport2
            };

            var obj5 = {
                captureTime: date2,
                testName: 'Test Google 2',
                userID: user2._id,
                viewport: viewport2
            };

            return ImageDiff.create([obj1, obj2, obj3, obj4, obj5]).then(function(data) {
                return TestConfig.getDiffsByViewport(viewport1, user1._id, 'Test Google');
            }).then(function(data) {
                expect(data).to.have.length(2);
                expect(data[0].userID.toString()).to.be.equal(user1._id.toString());
                expect(data[0]).to.have.deep.property('testName', 'Test Google');
                expect(data[0]).to.have.deep.property('viewport', viewport1);
                expect(data[1].userID.toString()).to.be.equal(user1._id.toString());
                expect(data[1]).to.have.deep.property('testName', 'Test Google');
                expect(data[1]).to.have.deep.property('viewport', viewport1);
                return TestConfig.getDiffsByViewport(viewport2, user2._id);
            }).then(function(data) {
                expect(data).to.have.length(2);
                expect(data[0].userID.toString()).to.be.equal(user2._id.toString());
                expect(data[0]).to.have.deep.property('viewport', viewport2);
                expect(data[1].userID.toString()).to.be.equal(user2._id.toString());
                expect(data[1]).to.have.deep.property('viewport', viewport2);
                return TestConfig.getDiffsByViewport(viewport1, user2._id);
            }).then(function(data) {
                expect(data).to.have.length(0);
            });
        });
    });

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

            var obj = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0,4],
                hourFrequency: [0,5],
                userID: user1._id
            };

            return TestConfig.create(obj).then(function(data) {
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
                expect(data[0].userID.toString()).to.be.equal(user1._id.toString());
                // expect(data[0]).to.have.deep.property('userID', user1._id); // this fails but I have no idea why
            }); 
        });

        it('findAllScheduledTests should return multiple testConfig documents', function () {

            var obj1 = {
                name: 'Test Google 1',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: user1._id
            };

            var obj2 = {
                name: 'Test Google 2',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [1],
                hourFrequency: [0],
                userID: user1._id
            };

            var obj3 = {
                name: 'Test Google 3',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0,2,4],
                hourFrequency: [0,10,16],
                userID: user1._id
            };

            var obj4 = {
                name: 'Test Google 4',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [1],
                userID: user1._id
            };

            var obj5 = {
                name: 'Test Google 5',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [1],
                hourFrequency: [1],
                userID: user1._id
            };

            return TestConfig.create([obj1, obj2, obj3, obj4, obj5]).then(function(data) {
                return TestConfig.findAllScheduledTests(0,0);
            }).then(function(data) {
                expect(data).to.have.length(2);
                expect(data[0].dayFrequency).to.include.members([0]);
                expect(data[0].hourFrequency).to.include.members([0]);
                expect(data[1].dayFrequency).to.include.members([0]);
                expect(data[1].hourFrequency).to.include.members([0]);
            }); 
        });

        it('crawlURL should return # of pages crawled', function () {
            var obj1 = {
                testName: 'FSA test',
                startURL: 'http://www.fullstackacademy.com',
                viewport: [ '1920x1200' ],
                dayFrequency: [ 4 ],
                hourFrequency: [ 10 ],
                userID: user1._id,
                maxDepth: 1,
                whitelist: '/faq'
            };
            
            return TestConfig.crawlURL(obj1).then(function(data) {
                expect(data).to.be.equal(2);
            }); 
        });
    });

    describe('runTestConfig method', function () {

        var AWSkeys = require('../../../server/app/routes/test-config/AWSkeys'); 
        process.env.AWS_ACCESS_KEY_ID = AWSkeys.accessKeyId;
        process.env.AWS_SECRET_ACCESS_KEY = AWSkeys.secretAccessKey;

        var AWS = require('aws-sdk'); 
        var s3 = new AWS.S3({params: {Bucket: 'capstone-doraemon'}});
        AWS.config.region = AWSkeys.region; 

        it('should exist', function () {
            var obj = {
                name: 'Test Google',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: user1._id
            };

            return TestConfig.create(obj).then(function(config) {
                expect(config.runTestConfig).to.be.a('function');
            })
        });

        it('should run a single testConfig document', function () {
            var nightmare = new Nightmare();
            var date = new Date('June 13, 2015 10:00:00');
            var testConfig;
            var obj = {
                name: 'Test-Config test',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: user1._id,
                enabled: true
            };

            this.timeout(20000);

            return TestConfig.create(obj).then(function(config) {
                testConfig = config;
                nightmare.run();
                return testConfig.runTestConfig(nightmare, date);
            }).then(function() {
                return ImageCapture.find({}).exec();
            }).then(function(data) {
                expect(data).to.have.length(1);
                expect(data[0]).to.have.deep.property('websiteURL','https://www.google.com/');
                expect(data[0]).to.have.deep.property('viewport','1024x768');
                expect(data[0]).to.have.deep.property('testName','Test-Config test');
                expect(data[0].testConfigID.toString()).to.be.equal(testConfig._id.toString());

                nightmare.run();
                return testConfig.runTestConfig(nightmare, date);
            }).then(function() {
                return ImageCapture.find({}).exec();
            }).then(function(data) {
                expect(data).to.have.length(2);
                expect(data[0]).to.have.deep.property('websiteURL','https://www.google.com/');
                expect(data[0]).to.have.deep.property('viewport','1024x768');
                expect(data[0]).to.have.deep.property('testName','Test-Config test');
                expect(data[0].testConfigID.toString()).to.be.equal(testConfig._id.toString());
                expect(data[1]).to.have.deep.property('websiteURL','https://www.google.com/');
                expect(data[1]).to.have.deep.property('viewport','1024x768');
                expect(data[1]).to.have.deep.property('testName','Test-Config test');
                expect(data[1].testConfigID.toString()).to.be.equal(testConfig._id.toString());

                // return testConfig.runTestConfig(nightmare, date);
            }); 
        });
    });
});