const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isAdmin } = require("../middleware");
const SettingController = require("../controllers/Setting");

router.get('/admin', isLoggedIn, isAdmin, SettingController.getSettings);
router.put('/admin/financial', isLoggedIn, isAdmin, SettingController.updateFinancialSettings);
router.put('/admin/system', isLoggedIn, isAdmin, SettingController.updateSystemSettings);

module.exports = router;
