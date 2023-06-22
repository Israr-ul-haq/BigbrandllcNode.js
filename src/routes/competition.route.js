const express = require("express");
const auth = require("../middlewares/auth");
const { competitionController } = require("../controllers");

const router = express.Router();
router
  .route("/get_competition")
  .get(auth({ anonymous: true }), competitionController.getCompetitionData);
router.post("/competitonSave", competitionController.AddCompetition);
router.put("/competitonUpdate/:id", competitionController.UpdateCompetition);

router.delete(
  "/competitionDelete/:id",
  competitionController.deleteCompetition
);

module.exports = router;
