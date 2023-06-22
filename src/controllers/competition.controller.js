const httpStatus = require("http-status");
const catchAsync = require("@utils/catchAsync");
const ApiError = require("@utils/ApiError");
const { competitionService } = require("@services");
const { Competition } = require("../models");

const AddCompetition = catchAsync(async (req, res) => {
  const cometeData = await competitionService.createCompetition(req.body);
  res.status(httpStatus.OK).send(cometeData);
});
const UpdateCompetition = catchAsync(async (req, res) => {
  const id = req.params.id;
  const cometeData = await competitionService.updateCompetition(id, req.body);
  res.status(httpStatus.OK).send(cometeData);
});

const getCompetitionData = catchAsync(async (req, res) => {
  const data = await Competition.find();
  res.status(httpStatus.OK).send(data);
});

const deleteCompetition = catchAsync(async (req, res) => {
  const id = req.params.id;
  await competitionService.deleteCompetition(id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  UpdateCompetition,
  AddCompetition,
  getCompetitionData,
  deleteCompetition,
};
