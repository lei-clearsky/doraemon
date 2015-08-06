var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);
var mongoose = require('mongoose');

var expect = require('chai').expect;

require('../../../server/db/models/user');
require('../../../server/db/models/image-capture');
require('../../../server/db/models/image-diff');
require('../../../server/db/models/test-config');
require('../../../server/db/models/test-case');

var User = mongoose.model('User');
var TestConfig = mongoose.model('TestConfig');
var ImageDiff = mongoose.model('ImageDiff');
var ImageCapture = mongoose.model('ImageCapture');

var supertest = require('supertest');
var app = require('../../../server/app');

describe('TestConfig Routes', function () {

	beforeEach('Establish DB connection', function (done) {
		if (mongoose.connection.db) return done();
		mongoose.connect(dbURI, done);
	});

	afterEach('Clear test database', function (done) {
		clearDB(done);
	});

	describe('POST request', function () {
		var guestAgent;

		beforeEach('Create guest agent', function () {
			guestAgent = supertest.agent(app);
		});

		it('to / should return a 200 response with created testConfigs in body', function (done) {
			var userInfo = {
				email: 'test@fsa.com',
				password: 'test'
			};

			User.create(userInfo).then(function(user) {
				var configInfo = [ { name: 'Test Config Post',
				    URL: 'http://reddit.com',
				    rootURL: 'http://reddit.com',
				    threshold: '5',
				    viewport: '1920x1200',
				    dayFrequency: [ 6 ],
				    hourFrequency: [ 10 ],
				    userID: user._id },
				  { name: 'Test Config Post',
				    URL: 'http://reddit.com',
				    rootURL: 'http://reddit.com',
				    threshold: '5',
				    viewport: '1440x900',
				    dayFrequency: [ 6 ],
				    hourFrequency: [ 10 ],
				    userID: user._id },
				  { name: 'Test Config Post',
				    URL: 'http://reddit.com/r/all',
				    rootURL: 'http://reddit.com',
				    threshold: null,
				    viewport: '1024x768',
				    dayFrequency: [ 6 ],
				    hourFrequency: [ 10 ],
				    userID: user._id },
				  { name: 'Test Config Post',
				    URL: 'http://reddit.com/r/all',
				    rootURL: 'http://reddit.com',
				    threshold: null,
				    viewport: '1920x1200',
				    dayFrequency: [ 6 ],
				    hourFrequency: [ 10 ],
				    userID: user._id },
				  { name: 'Test Config Post',
				    URL: 'http://reddit.com/r/news',
				    rootURL: 'http://reddit.com',
				    threshold: null,
				    viewport: '360x640',
				    dayFrequency: [ 2 ],
				    hourFrequency: [ 10 ],
				    userID: user._id } 
				];

				guestAgent.post('/api/test-config').send(configInfo).expect(200).end(function (err, response) {
					if (err) return done(err);
					expect(response.body).to.have.length(5);
					done();
				});
			});
		});

		it('to /bulkcreate should return a 200 response with # of testConfigs created in body', function (done) {
			var userInfo = {
				email: 'test@fsa.com',
				password: 'test'
			};

			this.timeout(5000);

			User.create(userInfo).then(function(user) {
				var configInfo = { testName: 'Test Routes Bulk',
					startURL: 'http://www.fullstackacademy.com',
					maxDepth: 1,
					viewport: [ '1920x1200', '1440x900' ],
					dayFrequency: [ 6, 2 ],
					hourFrequency: [ 10 ],
					userID: user._id 
				};

				guestAgent.post('/api/test-config/bulkcreate').send(configInfo).expect(200).end(function (err, response) {
					if (err) return done(err);
					expect(response.body).to.be.equal(14);
					done();
				});
			});
		});
	});
});