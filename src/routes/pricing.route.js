const express = require("express");
const validate = require("@middlewares/validate");
const { pricingController } = require("@controllers");
const auth = require("../middlewares/auth");

const router = express.Router();

router
  .route("/pricing_category/:brandId/:client_secret")
  .get(auth({ anonymous: true }), pricingController.getPricings);

router.put("/pricing_category", pricingController.updatePricings);

module.exports = router;
