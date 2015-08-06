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
var TestCase = mongoose.model('TestCase');
var ImageDiff = mongoose.model('ImageDiff');
var ImageCapture = mongoose.model('ImageCapture');

var supertest = require('supertest');
var app = require('../../../server/app');

describe('TestCase Routes', function () {

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

		it('to /api/test-case/extension should return a 200 response with temp testCase in body', function (done) {
			var userInfo = {
				email: 'test@fsa.com',
				password: 'test'
			};

			User.create(userInfo).then(function(user) {
				var testCaseInfo = { steps:
   					[ { stepCode: 1, eventText: 'URL', value: 'http://www.fullstackacademy.com/faq' },
     				{ stepCode: 2, eventText: 'Take Snapshot' },
     				{ stepCode: 3, eventText: 'Click', path: ["div#why_javascript", "h6"] },
     				{ stepCode: 2, eventText: 'Take Snapshot' },
     				{ stepCode: 3, eventText: 'Click', path: ["section#apply", "div", "div", "h6"] },
     				{ stepCode: 2, eventText: 'Take Snapshot' } ],
  					userID: user._id };

				guestAgent.post('/api/test-case/extension').send(testCaseInfo).expect(200).end(function (err, response) {
					if (err) return done(err);
					expect(response.body.userID.toString()).to.be.equal(user._id.toString());
					expect(response.body).to.have.deep.property('URL', 'http://www.fullstackacademy.com/faq');
					expect(response.body).to.have.deep.property('steps');
					done();
				});
			});
		});

		it('to /api/test-case should return a 200 response with testCase in body', function (done) {
			var userInfo = {
				email: 'test@fsa.com',
				password: 'test'
			};

			User.create(userInfo).then(function(user) {
				var testCaseInfo = [ 
				  {	name: 'Test Routes',
				    devURL: null,
				    threshold: 5,
				    dayFrequency: [ 6 ],
				    hourFrequency: [ 10 ],
				    URL: 'http://www.fullstackacademy.com/faq',
				    userID: user._id,
				    steps: [	{ stepCode: 1, eventText: 'URL', value: 'http://www.fullstackacademy.com/faq' },
	     						{ stepCode: 2, eventText: 'Take Snapshot' },
	     						{ stepCode: 3, eventText: 'Click', path: ["div#why_javascript", "h6"] },
	     						{ stepCode: 2, eventText: 'Take Snapshot' },
	     						{ stepCode: 3, eventText: 'Click', path: ["section#apply", "div", "div", "h6"] },
	     						{ stepCode: 2, eventText: 'Take Snapshot' } ],
				    viewport: '1440x900',
				    formCompleted: true },
				  { name: 'Test Routes',
				    devURL: null,
				    threshold: 5,
				    dayFrequency: [ 6 ],
				    hourFrequency: [ 10 ],
				    URL: 'http://www.fullstackacademy.com/faq',
				    userID: user._id,
				    steps: [ 	{ stepCode: 1, eventText: 'URL', value: 'http://www.fullstackacademy.com/faq' },
	     						{ stepCode: 2, eventText: 'Take Snapshot' },
	     						{ stepCode: 3, eventText: 'Click', path: ["div#why_javascript", "h6"] },
	     						{ stepCode: 2, eventText: 'Take Snapshot' },
	     						{ stepCode: 3, eventText: 'Click', path: ["section#apply", "div", "div", "h6"] },
	     						{ stepCode: 2, eventText: 'Take Snapshot' } ],
				    viewport: '1920x1200',
				    formCompleted: true } 
				];

				guestAgent.post('/api/test-case').send(testCaseInfo).expect(200).end(function (err, response) {
					if (err) return done(err);

					TestConfig.find({}).then(function(configs) {
						expect(configs).to.have.length(6);
						return TestCase.find({});
					}).then(function(cases) {
						expect(cases).to.have.length(2);
						done();
					});
				});
			});
		});
	});
});