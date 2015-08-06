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

describe('User Routes', function () {

	beforeEach('Establish DB connection', function (done) {
		if (mongoose.connection.db) return done();
		mongoose.connect(dbURI, done);
	});

	afterEach('Clear test database', function (done) {
		clearDB(done);
	});

	describe('GET requests', function () {

		var guestAgent;

		beforeEach('Create guest agent', function () {
			guestAgent = supertest.agent(app);
		});

		it('should return a 200 response with an empty array as the body', function (done) {
			guestAgent.get('/api/users').expect(200).end(function (err, response) {
				if (err) return done(err);
				expect(response.body).to.be.an('array');
				expect(response.body).to.have.length(0);
				done();
			});
		});

		it('should get a 200 response with an array of 1 as the body', function (done) {
			var userInfo = {
				email: 'test@fsa.com',
				password: 'test'
			};

			User.create(userInfo).then(function() {
				guestAgent.get('/api/users').expect(200).end(function (err, response) {
					if (err) return done(err);
					expect(response.body).to.be.an('array');
					expect(response.body).to.have.length(1);
					done();
				});
			});			
		});

		it('should get a 200 response with an array of 3 as the body', function (done) {
			var userInfo1 = {
				email: 'test1@fsa.com',
				password: 'test1'
			};

			var userInfo2 = {
				email: 'test2@fsa.com',
				password: 'test2'
			};

			var userInfo3 = {
				email: 'test3@fsa.com',
				password: 'test3'
			};

			User.create([userInfo1, userInfo2, userInfo3]).then(function() {
				guestAgent.get('/api/users').expect(200).end(function (err, response) {
					if (err) return done(err);
					expect(response.body).to.be.an('array');
					expect(response.body).to.have.length(3);
					done();
				});
			});			
		});

		it('should get a 200 response with user object matching id as the body', function (done) {
			var userInfo1 = {
				email: 'test1@fsa.com',
				password: 'test1'
			};

			var userInfo2 = {
				email: 'test2@fsa.com',
				password: 'test2'
			};

			var userInfo3 = {
				email: 'test3@fsa.com',
				password: 'test3'
			};

			User.create([userInfo1, userInfo2, userInfo3]).then(function(users) {
				guestAgent.get('/api/users/' + users[0]._id).expect(200).end(function (err, response) {
					if (err) return done(err);
					expect(response.body).to.not.be.an('array');
					expect(response.body._id.toString()).to.be.equal(users[0]._id.toString());
					expect(response.body.email).to.be.equal(users[0].email);
					done();
				});
			});			
		});
	});

	describe('POST requests', function () {

		var guestAgent;

		beforeEach('Create guest agent', function () {
			guestAgent = supertest.agent(app);
		});

		it('should return a 200 response with the created user as the body', function (done) {
			var userInfo = {
				email: 'test@fsa.com',
				password: 'test'
			};

			guestAgent.post('/api/users').send(userInfo).expect(200).end(function (err, response) {
				if (err) return done(err);
				expect(response.body.email).to.be.equal('test@fsa.com');
				done();
			});
		});

		it('should get a 200 responses with the created user in each body', function (done) {
			var userInfo1 = {
				email: 'test1@fsa.com',
				password: 'test1'
			};

			var userInfo2 = {
				email: 'test2@fsa.com',
				password: 'test2'
			};

			var userInfo3 = {
				email: 'test3@fsa.com',
				password: 'test3'
			};

			guestAgent.post('/api/users').send(userInfo1).expect(200).end(function (err, response) {
				if (err) return done(err);
				expect(response.body.email).to.be.equal('test1@fsa.com');
				
				guestAgent.post('/api/users').send(userInfo2).expect(200).end(function (err, response) {
					if (err) return done(err);
					expect(response.body.email).to.be.equal('test2@fsa.com');

					guestAgent.post('/api/users').send(userInfo3).expect(200).end(function (err, response) {
						if (err) return done(err);
						expect(response.body.email).to.be.equal('test3@fsa.com');
						
						User.find({}, function(err, users) {
							expect(users).to.be.length(3);
							done();
						});
					});	
				});	
			});			
		});
	});

	describe('Login requests', function () {

		var loggedInAgent;

		beforeEach('Create loggedIn user agent and authenticate', function () {
			loggedInAgent = supertest.agent(app);
		});

		it('should get with 200 response for sucessful login', function (done) {
			var userInfo = {
				email: 'test@fsa.com',
				password: 'test'
			};

			User.create(userInfo).then(function(data) {
				loggedInAgent.post('/login').send(userInfo).expect(200).end(function (err, response) {
					if (err) return done(err);
					expect(response.body.user.email).to.be.equal(userInfo.email);
					expect(response.body.user._id.toString()).to.be.equal(data._id.toString());
					done();
				});
			});
		});

		it('should get with 401 response for unsucessful login', function (done) {
			var userInfo1 = {
				email: 'tes1@fsa.com',
				password: 'test1'
			};

			var userInfo2 = {
				email: 'test2@fsa.com',
				password: 'test2'
			};

			User.create(userInfo1).then(function(data) {
				loggedInAgent.post('/login').send(userInfo2).expect(401).end(function (err, response) {
					if (err) return done(err);
					done();
				});
			});
		});

	});

});