<h3 align="center">Private Pixels - A Visual UI Test Automation Service</h3>

---

An automatic visual UI testing and monitoring service built on the MEAN stack.

Our stack basically consists of:
- Nightmare.js which is a headless browser using the Webkit render engine. Used to create snapshots of webpages.
- GraphicsMagick is an image manipulation tool able to run in node.js. Used to create a diff image of two snapshots.
- AWS is used to store our images.
- CronJob is used to schedule tasks at set intervals. 
- Roboto is a web crawler used to find web pages on a site. 
- Angular, Bootstrap & Sass is used in the front end to create our dynamic UI.
- FSG was used as a basic MEAN stack scaffolding generator.

At set intervals, we use nightmare.js to take a snapshot of a webpage at a given URL. With this current snapshot, we will then grab the previous snapshot taken at that URL, then use GraphicsMagick to create a diff image of the two snapshots. That diff image is then posted in our dashboard and an alert is set if a substantial difference is calculated.

#### Check out a demo [here](https://boiling-island-8716.herokuapp.com/)

A Chrome Extension was also developed to test single page applications and web pages with dynamic UI features. Download it at the Play store [here](https://chrome.google.com/webstore/detail/private-pixels-step-recor/mjmcnfmjfnhdpngopmpdlegjpidnnmip).

#### Check out the Chrome Extension repo [here](https://github.com/vatteh/doraemon_recorder).