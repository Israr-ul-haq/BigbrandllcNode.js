const express = require("express");
const auth = require("../middlewares/auth");
const { integrationController } = require("../controllers");

const router = express.Router();

router.post("/create_integration", integrationController.createIntegration);
router.get("/get_integration_data", integrationController.getIntegrationData);
router.put("/update_integration", integrationController.updateIntegrationData);
router.put("/update_integration_status", integrationController.updateStatus);
router.delete("/delete_integration/:id", integrationController.deleteInteg);

module.exports = router;
