const httpStatus = require("http-status");
const catchAsync = require("@utils/catchAsync");
const ApiError = require("@utils/ApiError");
const { integrationService } = require("../services");

const createIntegration = catchAsync(async (req, res) => {
  const data = await integrationService.createIntegration(req.body);
  res.status(httpStatus.CREATED).send(data);
});

const getIntegrationData = catchAsync(async (req, res) => {
  const data = await integrationService.getIntegrationData(req.body);
  res.status(httpStatus.OK).send(data);
});

module.exports = {
  createIntegration,
  getIntegrationData,
};
