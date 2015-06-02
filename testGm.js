var phantom = require('phantom');
var gm = require('gm');
var q = require('q');

var url1 = "https://news.ycombinator.com/news?p=1";
var url2 = "https://news.ycombinator.com/news?p=2";

// var url1 = "http://lei-clearsky.github.io/nanodegree-fewd-p2/";
// var url2 = "http://lei-clearsky.github.io/lei-resume/";

var img1path = 'img5.png';
var img2path = 'img6.png';

function getSnapshot(url, img) {
    var df = q.defer();

    phantom.create(function(ph) {
        ph.createPage(function(page) {
            page.set("viewportSize", { width: 1024, height: 768 });
              page.open(url, function(status) {
                  console.log("rendering " + url + "....");
                  page.render(img);
                  ph.exit();

                  df.resolve(img);
              });
        });
    });

    return df.promise;
};

function createDiff(img1, img2) {
      var options = {
        highlightColor: 'yellow', 
        file: './diff.png',
        tolerance: 0.02 
      };

      gm.compare(img1, img2, options, function (err, isEqual, equality, raw) {
        if (err) throw err;

        console.log('The images are equal: ', isEqual);
        console.log('Actual equality: ', equality);
        console.log('Raw output was: ', raw);
      });
};

function start() {
    var promises = [];

    promises.push(getSnapshot(url1, img1path));
    promises.push(getSnapshot(url2, img2path));

      q.all(promises).then(function(results) {

          console.log("Comparing " + results[0] + " and " + results[1] + "....");
          // Eventhough I used promises to make sure createDiff() is not called until page.render() has been called,
          // I was not able to find a way to make sure phantomjs was finished writing screenshots before gm.compare() was called
          // Need better solution
          setTimeout(function() { 
            createDiff(results[0], results[1]);
          }, 1000);

      });
}

start();