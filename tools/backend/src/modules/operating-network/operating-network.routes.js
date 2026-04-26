const express = require('express');
const controller = require('./operating-network.controller');

const router = express.Router();
router.get('/overview', controller.overview);

module.exports = router;
