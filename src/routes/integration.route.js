const express = require("express");
const auth = require("../middlewares/auth");
const { integrationController } = require("../controllers");

const router = express.Router();

router.post("/create_integration", integrationController.createIntegration);
router.get("/get_integration_data", integrationController.getIntegrationData);

module.exports = router;
