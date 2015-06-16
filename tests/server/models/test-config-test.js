var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var mongoose = require('mongoose');

require('../../../server/db/models/test-config');

var TestConfig = mongoose.model('TestConfig');

describe('TestConfig model', function () {

    beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
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

            var obj = {
                name: 'Test 1',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: null,
                teamID: null
            };

            return TestConfig.create(obj).then(function(data) {
                expect(data).to.have.deep.property('name','Test 1');
                expect(data).to.have.deep.property('URL','https://www.google.com/');
                expect(data).to.have.deep.property('viewport','1024x768');
                expect(data.dayFrequency).to.have.members([0]);
                expect(data.hourFrequency).to.have.members([0]);
                expect(data.viewportWidth).to.be.equal(1024);
                expect(data.viewportHeight).to.be.equal(768);
                expect(data).to.have.deep.property('userID',null);
                expect(data).to.have.deep.property('teamID',null);
            }); 
        });

        it('should return multiple new testConfig documents', function () {

            var obj1 = {
                name: 'Test 1',
                URL: 'https://www.google.com/',
                viewport: '1024x768',
                dayFrequency: [0],
                hourFrequency: [0],
                userID: null,
                teamID: null
            };

            var obj2 = {
                name: 'Test 2',
                URL: 'https://www.yahoo.com/',
                viewport: '1024x768',
                dayFrequency: [1],
                hourFrequency: [1],
                userID: null,
                teamID: null
            };

            var obj3 = {
                name: 'Test 3',
                URL: 'https://www.bing.com/',
                viewport: '1024x768',
                dayFrequency: [2],
                hourFrequency: [2],
                userID: null,
                teamID: null
            };

            return TestConfig.create([obj1, obj2, obj3]).then(function(data) {
                return TestConfig.find({}).exec().then(function(data) {
                    expect(data).to.have.length(3);
                });

                expect(data).to.have.deep.property('name','Test 1');
                expect(data).to.have.deep.property('URL','https://www.google.com/');
                expect(data).to.have.deep.property('viewport','1024x768');
                expect(data.dayFrequency).to.have.members([0]);
                expect(data.hourFrequency).to.have.members([0]);
                expect(data.viewportWidth).to.be.equal(1024);
                expect(data.viewportHeight).to.be.equal(768);
                expect(data).to.have.deep.property('userID',null);
                expect(data).to.have.deep.property('teamID',null);
            }); 
        });
    });

    describe('Scheduled UI Tests', function () {

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
                    dayFrequency: [0],
                    hourFrequency: [0],
                    userID: null,
                    teamID: null
                };

                return TestConfig.create(obj).then(function(data) {
                    return TestConfig.findAllScheduledTests(0,0).then(function(data) {
                        expect(data).to.have.length(1);

                        expect(data[0]).to.have.deep.property('name','Test Google');
                        expect(data[0]).to.have.deep.property('URL','https://www.google.com/');
                        expect(data[0]).to.have.deep.property('viewport','1024x768');
                        expect(data[0].dayFrequency).to.include.members([0]);
                        expect(data[0].hourFrequency).to.include.members([0]);
                        expect(data[0].viewportWidth).to.be.equal(1024);
                        expect(data[0].viewportHeight).to.be.equal(768);
                        expect(data[0]).to.have.deep.property('userID',null);
                        expect(data[0]).to.have.deep.property('teamID',null);
                    });
                }); 
            });

            it('should return multiple testConfig documents', function () {

                var obj1 = {
                    name: 'Test Google 1',
                    URL: 'https://www.google.com/',
                    viewport: '1024x768',
                    dayFrequency: [0],
                    hourFrequency: [0],
                    userID: null,
                    teamID: null
                };

                var obj2 = {
                    name: 'Test Google 2',
                    URL: 'https://www.google.com/',
                    viewport: '1024x768',
                    dayFrequency: [1],
                    hourFrequency: [0],
                    userID: null,
                    teamID: null
                };

                var obj3 = {
                    name: 'Test Google 3',
                    URL: 'https://www.google.com/',
                    viewport: '1024x768',
                    dayFrequency: [0,2,4],
                    hourFrequency: [0,10,16],
                    userID: null,
                    teamID: null
                };

                var obj4 = {
                    name: 'Test Google 4',
                    URL: 'https://www.google.com/',
                    viewport: '1024x768',
                    dayFrequency: [0],
                    hourFrequency: [1],
                    userID: null,
                    teamID: null
                };

                var obj5 = {
                    name: 'Test Google 5',
                    URL: 'https://www.google.com/',
                    viewport: '1024x768',
                    dayFrequency: [1],
                    hourFrequency: [1],
                    userID: null,
                    teamID: null
                };

                return TestConfig.create([obj1, obj2, obj3, obj4, obj5]).then(function(data) {
                    return TestConfig.findAllScheduledTests(0,0).then(function(data) {
                        expect(data).to.have.length(2);
                        expect(data[0].dayFrequency).to.include.members([0]);
                        expect(data[0].hourFrequency).to.include.members([0]);
                        expect(data[1].dayFrequency).to.include.members([0]);
                        expect(data[1].hourFrequency).to.include.members([0]);
                    });
                }); 
            });
        });
    });
});