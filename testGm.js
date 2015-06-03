var phantom = require('phantom');
var gm = require('gm');
var q = require('q');
var Spooky = require('spooky');
var casper = require('casper');

// test spooky
var spooky = new Spooky({
        child: {
            transport: 'http'
        },
        casper: {
            logLevel: 'debug',
            verbose: true
        }
    }, function (err) {
        if (err) {
            e = new Error('Failed to initialize SpookyJS');
            e.details = err;
            throw e;
        }

        // test google
        var links = [];

		spooky.start('http://google.fr/', function() {
		    // search for 'casperjs' from google form
		    this.fill('form[action="/search"]', { q: 'casperjs' }, true);
		});

		spooky.then(function() {
			function getLinks() {
			    var links = document.querySelectorAll('h3.r a');
			    return Array.prototype.map.call(links, function(e) {
			        return e.getAttribute('href');
			    });
			}
		    // aggregate results for the 'casperjs' search
		    links = this.evaluate(getLinks);
		    // now search for 'phantomjs' by filling the form again
		    this.fill('form[action="/search"]', { q: 'phantomjs' }, true);
		});

		spooky.then(function() {
			function getLinks() {
			    var links = document.querySelectorAll('h3.r a');
			    return Array.prototype.map.call(links, function(e) {
			        return e.getAttribute('href');
			    });
			}
		    // aggregate results for the 'phantomjs' search
		    links = links.concat(this.evaluate(getLinks));
		});

		spooky.run(function() {
		    // echo results in some pretty fashion
		    this.echo(links.length + ' links found:');
		    this.echo(' - ' + links.join('\n - ')).exit();
		});

        // end test google



        // spooky.start('http://www.google.com');
        
        // spooky.then(function () {
        // 	console.log('test casper in spooky!!!!!');
        //     this.emit('hello', 'Hello, from ' + this.evaluate(function () {
        //         return document.title;
        //     }));
        // });
        // spooky.run();
    });

spooky.on('error', function (e, stack) {
	console.log('errors?????');
    console.error(e);

    if (stack) {
        console.log(stack);
    }
});

// Uncomment this block to see all of the things Casper has to say.
// There are a lot.
// He has opinions.
spooky.on('console', function (line) {
    console.log(line);
});

spooky.on('hello', function (greeting) {
    console.log(greeting);
});

spooky.on('log', function (log) {
    if (log.space === 'remote') {
        console.log(log.message.replace(/ \- .*/, ''));
    }
});
// end test


// var url1 = "https://news.ycombinator.com/news?p=1";
// var url2 = "https://news.ycombinator.com/news?p=2";

// var img1 = 'img1.png';
// var img2 = 'img2.png';

// var url1 = "http://lei-clearsky.github.io/nanodegree-fewd-p2/";
// var url2 = "http://lei-clearsky.github.io/lei-resume/";

// var img1path = 'img3.png';
// var img2path = 'img4.png';

// function getSnapshot(url, img) {
//     // var df = q.defer();

//     phantom.create(function(ph) {
//         ph.createPage(function(page) {
//             page.set("viewportSize", { width: 1024, height: 768 });
//               page.open(url, function(status) {
//                   console.log("rendering " + url + "....");
//                   page.render(img);
//                   ph.exit();

//                   // df.resolve(img);
//               });
//         });
//     });

//     // return df.promise;
// };

// function createDiff(img1, img2) {
//       var options = {
//         highlightColor: 'yellow', 
//         file: './diff.png',
//         tolerance: 0.02 
//       };

//       gm.compare(img1, img2, options, function (err, isEqual, equality, raw) {
//         if (err) throw err;

//         console.log('The images are equal: ', isEqual);
//         console.log('Actual equality: ', equality);
//         console.log('Raw output was: ', raw);
//       });
// };

// function start() {
//     var promises = [];

//     promises.push(getSnapshot(url1, img1path));
//     promises.push(getSnapshot(url2, img2path));

//       q.all(promises).then(function(results) {

//           console.log("Comparing " + results[0] + " and " + results[1] + "....");
//           // Eventhough I used promises to make sure createDiff() is not called until page.render() has been called,
//           // I was not able to find a way to make sure phantomjs was finished writing screenshots before gm.compare() was called
//           // Need better solution
//           setTimeout(function() { 
//             createDiff(results[0], results[1]);
//           }, 1000);

//       });
// }

// function start() {

// 	// getSnapshot(url1, img1path);
// 	// getSnapshot(url2, img2path);

// 	phantom.create(function(ph) {
//         ph.createPage(function(page) {
//             page.set("viewportSize", { width: 1024, height: 768 });
//               page.open(url1, function(status) {
//                   console.log("rendering " + url1 + "....");
//                   page.render(img1);

//                   page.open(url2, function(status) {
//                   	console.log("rendering " + url2 + "....");
//                   	page.render(img2);
//                   	ph.exit();	
//                   });
                  
//               });
//         });
//     });
	
// 	setTimeout(function() { 
//         createDiff(img1, img2);
//     }, 3000);
    
// }

// start();

var url1 = "http://www.westsiderag.com/2015/06/01/food-buzz-and-a-slideshow-from-new-taste-of-the-upper-west-side";
var url2 = "http://www.westsiderag.com/category/columns-2";

var img5 = 'img5.png';
var img6 = 'img6.png';


function start() {

  phantom.create(function(ph) {
    ph.createPage(function(page) {
      page.open(url1, function(status) {
          console.log('rendering first image...')
          page.render(img5);
          console.log('this is the first img', img5)


          page.open(url2, function() {
                console.log('rendering second image...')
                page.render(img6);

                ph.exit();
          });
        });

    })
  })
}


function compareUrls() {
  var options = {
        highlightColor: 'yellow', // optional. Defaults to red
        file: './diff3.png' // required
  };
  // need to wait for images to get saved
  gm.compare(img5, img6, options, function (err, isEqual, equality, raw) {
        if (err) throw err;
        console.log('The images are equal: %s', isEqual);
        console.log('Actual equality: %d', equality);
        console.log('Raw output was: %j', raw);

        //ph.exit();
  });
};
//start();
compareUrls();