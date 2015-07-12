'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/test-config', require('./test-config'));
router.use('/test-case', require('./test-case'));
router.use('/screenshots', require('./screenshots'));
router.use('/users', require('./users'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});