const express = require("express");
const router = express.Router({ mergeParams: true });
const NotificationController = require("../controllers/Notification");
const { isLoggedIn } = require("../middleware");

router.get('/get',isLoggedIn,NotificationController.get);
router.post('/read-all',isLoggedIn,NotificationController.markAsRead);

module.exports = router;