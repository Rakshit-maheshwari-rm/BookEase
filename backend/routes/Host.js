const express = require("express");
const router = express.Router({ mergeParams: true });
const HostController = require("../controllers/Host");
const { isLoggedIn, isAdmin } = require("../middleware");
const upload = require("../multer");

router.post('/create', upload.single('idImage'), HostController.create);
router.post('/check-host', HostController.check);

router.get("/admin/requests", isLoggedIn, isAdmin, HostController.adminGetAll);
router.put("/admin/requests/:id/approve", isLoggedIn, isAdmin, HostController.adminApprove);
router.put("/admin/requests/:id/reject", isLoggedIn, isAdmin, HostController.adminReject);

module.exports = router;