const express = require("express");
const auth = require("../middlewares/auth");
const { competitionProductsController } = require("../controllers");

const router = express.Router();

router.post(
  "/crete_competition_products",
  competitionProductsController.createCompetionProducts
);
router.get(
  "/get_competition_products",
  competitionProductsController.getCompetitionProductsData
);

module.exports = router;
