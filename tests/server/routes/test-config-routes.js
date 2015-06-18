var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);
var mongoose = require('mongoose');

var supertest = require('supertest');
// var app = require('../../../server/app');
// var agent = supertest.agent(app);

var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
chai.use(spies);

require('../../../server/db/models/test-config');
require('../../../server/db/models/image-capture');
require('../../../server/db/models/image-diff');

var TestConfig = mongoose.model('TestConfig');
var ImageCapture = mongoose.model('ImageCapture');
var ImageDiff = mongoose.model('ImageDiff');


describe('HTTP requests', function() {

    beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    afterEach('Clear test database', function (done) {
        clearDB(done);
    });

	before(function(done) {
        TestConfig.remove({}, done);
    });

    // describe('GET /', function() {
    // 	 it('should get 200 on api/test-config/', function(done) {
	   //      agent
	   //      	.get('api/test-config/')
	   //       	.expect(200, done)
	   //  })
    // })

    // describe('GET /wiki/:title', function() {
    //     it('should get 404 on page that doesnt exist', function(done) {
    //     	agent
	   //        .get('/wiki/foo_bar')
	   //        .expect(404, done)	
    //     });

    //     it('should get 200 on page that does exist', function(done) {
    //     	agent
	   //        .get('/wiki/foo')
	   //        .expect(200, done)	
    //     });
    // })

    // describe('GET /wiki/tags/:tag', function() {
    //     it('should get 200', function(done) {
    //     	agent
	   //        .get('/wiki/tags/coding')
	   //        .expect(200, done)
    //     })
    // })

    // describe('GET /wiki/:title/similar', function() {
    //     it('should get 404 for page that doesn\'t exist', function(done) {
    //     	agent
	   //        .get('/wiki/foo_bar/similar')
	   //        .expect(404, done)
    //     });

    //     it('should get 200 for similar page', function(done) {
    //     	agent
	   //        .get('/wiki/foo/similar')
	   //        .expect(200, done)
    //     })
    // })

    // describe('GET /wiki/:title/edit', function() {
    //     it('should get 404 for page that doesn\'t exist', function(done) {
    //     	agent
	   //        .get('/wiki/foo_bar/edit')
	   //        .expect(404, done)
    //     });

    //     it('should get 200 for similar page', function(done) {
    //     	agent
	   //        .get('/wiki/foo/edit')
	   //        .expect(200, done)
    //     })
    // })

    // describe('GET /add', function() {
    //     it('should get 200', function(done) {
    //     	agent
	   //        .get('/add')
	   //        .expect(200, done)
    //     })
    // })

    // describe('POST /wiki/:title/edit', function() {
    //     it('should get 404 for page that doesn\'t exist', function(done) {
    //     	agent
	   //        .post('/wiki/foo_bar/edit')
	   //        .expect(404, done)
    //     });

    //     it('should update db', function(done) {
    //     	agent
	   //        .post('/wiki/foo/edit')
	   //        .send({body: "foo bar", tags: 'hi, bye'})
	   //        .expect(200)
	   //        .end(function (err, res) {
	   //        	models.Page.findOne({title: 'foo'}, function(err, page) {
	   //        		expect(page.body).to.equal('foo bar');	
	   //        		done();
	   //        	});
	   //        });	          
    //     });
    // })

    // describe('POST /add/submit', function() {
    //     it('should create in db', function(done) {

    //     	agent
	   //        .post('/add/submit')
	   //        .send({title: "zoo", body: "foo bar zoo", tags: 'hi, bye'})
	   //        .expect(200)
	   //        .end(function (err, res) {
	   //        	models.Page.findOne({title: 'zoo'}, function(err, page) {
	   //        		expect(page.body).to.equal('foo bar zoo');	
	   //        		done();
	   //        	});
	   //        });


    //     })
    // })

})