const httpStatus = require("http-status");
const catchAsync = require("@utils/catchAsync");
const ApiError = require("@utils/ApiError");
const { shippingService } = require("../services");
const { ShippingRules } = require("../models");

const createShippingRule = catchAsync(async (req, res) => {
  const contact = await shippingService.createRule(req.body);
  res.status(httpStatus.CREATED).send(contact);
});
const updateShippingRule = catchAsync(async (req, res) => {
  const { ruleId, ...updatedFields } = req.body;
  const shipping = await shippingService.updateRule(ruleId, updatedFields);
  res.status(httpStatus.OK).send(shipping);
});

const deleteShippingRule = catchAsync(async (req, res) => {
  const ruleId = req.params.ruleId;
  await shippingService.deleteRule(ruleId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getAllRules = catchAsync(async (req, res) => {
  const rules = await ShippingRules.find();
  console.log(rules);
  res.status(httpStatus.OK).send(rules);
});

module.exports = {
  createShippingRule,
  updateShippingRule,
  deleteShippingRule,
  getAllRules,
};
