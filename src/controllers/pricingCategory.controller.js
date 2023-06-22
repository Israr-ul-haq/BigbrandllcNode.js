const httpStatus = require("http-status");
const catchAsync = require("@utils/catchAsync");
const ApiError = require("@utils/ApiError");
const { pricingService } = require("@services");

const getPricings = catchAsync(async (req, res) => {
  const { brandId } = req.params;
  const pricingCategory = await pricingService.getPricingCategory(brandId);
  res.status(httpStatus.OK).send(pricingCategory);
});
const updatePricings = catchAsync(async (req, res) => {
  const pricingCategory = await pricingService.updatePricingCategory(req.body);
  res.status(httpStatus.OK).send(pricingCategory);
});

module.exports = {
  getPricings,
  updatePricings,
};
