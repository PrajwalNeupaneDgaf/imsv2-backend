const express = require('express');
const router = express.Router();
const HomePageController = require('../Controller/HomepageController');
const { Authorize } = require('../Middleware/UserMiddleware');

// Route for the homepage data

router.use(Authorize)
router.get('/home-page-data', HomePageController.getHomePageData);

module.exports = router;
