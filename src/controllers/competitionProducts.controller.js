const httpStatus = require("http-status");
const catchAsync = require("@utils/catchAsync");
const ApiError = require("@utils/ApiError");
const { competitionProductsService } = require("../services");

const createCompetionProducts = catchAsync(async (req, res) => {
  const { competeData, productFields } = req.body;

  const cometeData = await competitionProductsService.createCompetitionProducts(
    competeData,
    productFields
  );
  res.status(httpStatus.OK).send(cometeData);
});
const getCompetitionProductsData = catchAsync(async (req, res) => {
  const { brandId, websiteId, productId } = req.query;

  const cometeData = await competitionProductsService.getCompetitionProducts(
    brandId,
    websiteId,
    productId
  );
  res.status(httpStatus.OK).send(cometeData);
});

module.exports = {
  createCompetionProducts,
  getCompetitionProductsData,
};
