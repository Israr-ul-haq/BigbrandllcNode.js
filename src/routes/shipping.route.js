const express = require("express");
const { shippingController } = require("../controllers");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/freight_shiping_rule", shippingController.createShippingRule);
router.put("/freight_shiping_rule", shippingController.updateShippingRule);
router.delete(
  "/freight_shiping_rule/:ruleId",
  shippingController.deleteShippingRule
);

// router.get("/freight_shipping_rules", shippingController.getAllRules);
router
  .route("/freight_shipping_rules")
  .get(auth({ anonymous: true }), shippingController.getAllRules);

module.exports = router;
