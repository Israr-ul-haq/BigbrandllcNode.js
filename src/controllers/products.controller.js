const httpStatus = require("http-status");
const catchAsync = require("@utils/catchAsync");
const ApiError = require("@utils/ApiError");
const { productsService } = require("@services");

const getProductsById = catchAsync(async (req, res) => {
  const { sku } = req.params;
  const productsById = await productsService.getProducts(sku);
  res.status(httpStatus.OK).send(productsById);
});

const getAllProducts = catchAsync(async (req, res) => {
  const productsAllProducts = await productsService.getAllProducts(req.query);
  res.status(httpStatus.OK).send(productsAllProducts);
});
const getProductsByZeroValue = catchAsync(async (req, res) => {
  const productsAllProducts = await productsService.getZeroProducts(req.query);
  res.status(httpStatus.OK).send(productsAllProducts);
});
const updateProducts = catchAsync(async (req, res) => {
  const { id } = req.params;
  const productsAllProducts = await productsService.updateProduct(id, req.body);
  res.status(httpStatus.OK).send(productsAllProducts);
});
const updateProductsStatus = catchAsync(async (req, res) => {
  const updateProduct = await productsService.productSelectStatus(req.body);
  res.status(httpStatus.OK).send(updateProduct);
});

const getSelectedProducts = catchAsync(async (req, res) => {
  const productsByStatus = await productsService.getProductsByStatus();
  res.status(httpStatus.OK).send(productsByStatus);
});
const setAkeneoStatusFalse = catchAsync(async (req, res) => {
  const productsByStatus = await productsService.setAllAkeneoStatusToFalse();
  res.status(httpStatus.OK).send(productsByStatus);
});
const updateProductWebsiteId = catchAsync(async (req, res) => {
  const { id } = req.params;
  const products = await productsService.updateProductsWebsiteId(id, req.body);
  res.status(httpStatus.OK).send(products);
});

const updateCompetitionProducts = catchAsync(async (req, res) => {
  const { id } = req.params;
  const productsAllProducts = await productsService.updateCompetitionProduct(
    id,
    req.body
  );
  res.status(httpStatus.OK).send(productsAllProducts);
});
const deleteProducts = catchAsync(async (req, res) => {
  const productsAllProducts = await productsService.deleteProducts();
  res.status(httpStatus.OK).send(productsAllProducts);
});
const selectedSearchedProducts = catchAsync(async (req, res) => {
  const productsAllProducts = await productsService.setSelectedSearchProducts(
    req.query
  );
  res.status(httpStatus.OK).send(productsAllProducts);
});

module.exports = {
  getProductsById,
  getAllProducts,
  updateProducts,
  getProductsByZeroValue,
  updateProductsStatus,
  getSelectedProducts,
  setAkeneoStatusFalse,
  updateProductWebsiteId,
  updateCompetitionProducts,
  deleteProducts,
  selectedSearchedProducts,
};
