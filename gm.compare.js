var phantom = require('phantom');
var gm = require('gm');
var q = require('q');

var url1 = "https://news.ycombinator.com/news?p=1";
var url2 = "https://news.ycombinator.com/news?p=2";

var img1path = 'img1.png';
var img2path = 'img2.png';

function getSnapshot(url, img) {
    var df = q.defer();
    phantom.create(function(ph) {
        ph.createPage(function(page) {
            page.set("viewportSize", { width: 1024, height: 768 });
              page.open(url, function(status) {
                  console.log("rendering " + url + "....");
                  page.render(img, function() {
                      df.resolve(img);
                  });
                  ph.exit();
              });
        });
    });
    return df.promise;
};

function createDiff(img1, img2) {
      var options = {
        highlightColor: 'red', 
        file: './diff.png' 
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
          createDiff(results[0], results[1]);

      });
}

start();

















