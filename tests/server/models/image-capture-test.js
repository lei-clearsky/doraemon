var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var mongoose = require('mongoose');

require('../../../server/db/models/image-capture');

var ImageCapture = mongoose.model('ImageCapture');

describe('ImageCapture model', function () {

    beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    afterEach('Clear test database', function (done) {
        clearDB(done);
    });

    it('should exist', function () {
        expect(ImageCapture).to.be.a('function');
    });

    describe('ImageCapture.create method', function () {

        it('should return a new ImageCapture document', function () {

            var obj = {
                websiteURL: 'https://www.google.com/',
                viewport: '1024x768',
                userID: null
            };

            return ImageCapture.create(obj).then(function(data) {
                expect(data).to.have.deep.property('websiteURL','https://www.google.com/');
                expect(data).to.have.deep.property('viewport','1024x768');
                expect(data).to.have.deep.property('userID',null);
            }); 
        });

        it('should return multiple new ImageCapture documents', function () {

            var obj1 = {
                websiteURL: 'https://www.google.com/',
                viewport: '1024x768',
                userID: null
            };

            var obj2 = {
                websiteURL: 'https://www.yahoo.com/',
                viewport: '1024x768',
                userID: null
            };

            var obj3 = {
                websiteURL: 'https://www.msn.com/',
                viewport: '1024x768',
                userID: null
            };

            return ImageCapture.create([obj1, obj2, obj3]).then(function(data) {
                return ImageCapture.find({}).exec().then(function(data) {
                    expect(data).to.have.length(3);
                });
            }); 
        });
    });

    describe('Scheduled UI Tests', function () {

        describe('searchForLastSaved method', function () {

            it('should exist', function () {
                expect(ImageCapture.searchForLastSaved).to.be.a('function');
            });

            it('should return null', function () {
                return ImageCapture.searchForLastSaved().then(function(data) {
                    expect(data).to.be.equal(null);
                });
            });

            it('should return an ImageCapture document with the right paramaters', function () {

                var obj = {
                    websiteURL: 'https://www.google.com/',
                    viewport: '1024x768',
                    userID: null
                };

                return ImageCapture.create(obj).then(function(data) {
                    
                    return ImageCapture.searchForLastSaved('https://www.google.com/', null, '1024x768');
                }).then(function(data) {
                    expect(data).to.be.a('object');
                    expect(data).to.have.deep.property('websiteURL','https://www.google.com/');
                    expect(data).to.have.deep.property('viewport','1024x768');
                    expect(data).to.have.deep.property('userID',null);

                    return ImageCapture.searchForLastSaved('https://www.yahoo.com/', null, '1024x768');
                }).then(function(data) {
                    
                    expect(data).to.be.equal(null);
                }); 
            });

            it('should return only one ImageCapture document', function () {

                var obj1 = {
                    websiteURL: 'https://www.msn.com/',
                    viewport: '1024x768',
                    userID: null
                };

                var obj2 = {
                    websiteURL: 'https://www.yahoo.com/',
                    viewport: '1024x768',
                    userID: null
                };

                var obj3 = {
                    websiteURL: 'https://www.google.com/',
                    viewport: '1024x768',
                    userID: null
                };

                return ImageCapture.create(obj1).then(function(data) {
                    return ImageCapture.create(obj2);
                }).then(function(data) {
                    return ImageCapture.create(obj3);
                }).then(function(data) {
                    return ImageCapture.searchForLastSaved('https://www.yahoo.com/', null, '1024x768');
                }).then(function(data) {
                    expect(data).to.be.a('object');
                    expect(data).to.have.deep.property('websiteURL','https://www.yahoo.com/');
                    expect(data).to.have.deep.property('viewport','1024x768');
                    expect(data).to.have.deep.property('userID',null);

                    return ImageCapture.searchForLastSaved('https://www.yahoo.com/', null, '640x480');
                }).then(function(data) {
                    expect(data).to.be.equal(null);
                }); 
            });
        });
    });
});