const httpStatus = require("http-status"),
  { Products } = require("@models"),
  ApiError = require("@utils/ApiError"),
  customLabels = require("@utils/customLabels"),
  defaultSort = require("@utils/defaultSort");

/**
 * Get Products
 * @param {ObjectId} sku
 * @returns {Promise<Products[]>}
 * @throws {ApiError}
 */
const getProducts = async (sku) => {
  const products = await Products.findOne({
    SKU: sku,
  });
  return products;
};

/**
 * Get Products
 * @returns {Promise<Products[]>}
 * @throws {ApiError}
 */
const getAllProducts = async (query) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    brandId = "",
    pricing_category = "",
    includeZeroPrice = false,
    hasPrice = false,
  } = query;
  const regex = new RegExp(search, "i");

  const searchQuery = {
    $or: [
      { Product_Name: regex },
      { SKU: regex },
      { Brand: regex },
      { Product_Type: regex },
      { Pricing_Category: regex },
    ],
  };

  if (brandId !== "") {
    searchQuery.Brand = brandId;
  }

  if (pricing_category !== "") {
    searchQuery.Pricing_Category = pricing_category;
  }
  if (includeZeroPrice === "true") {
    searchQuery.Price = 0;
  }
  if (hasPrice === "true") {
    searchQuery.Price = { $gt: 0 }; // Include products with prices greater than 0
  }

  const total = await Products.countDocuments(searchQuery);
  const totalPages = Math.ceil(total / limit);
  const adjustedPage = Math.min(page, totalPages); // Adjust the page number if it exceeds the total pages

  const startIndex = (adjustedPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  const products = await Products.find(searchQuery)
    .sort({ _id: 1 })
    .skip(startIndex)
    .limit(limit);

  const results = {
    currentPage: adjustedPage,
    totalPages: totalPages,
    totalResults: total,
    results: products,
  };

  if (products.length === 0) {
    results.message = "No products found.";
  }

  return results;
};

const getZeroProducts = async (query) => {
  try {
    const { page = 1, limit = 10 } = query;
    const startIndex = (page - 1) * limit;

    const count = await Products.countDocuments({ Price: 0 });
    const totalPages = Math.ceil(count / limit);

    const products = await Products.find({ Price: 0 })
      .skip(startIndex)
      .limit(limit);

    const results = {
      currentPage: parseInt(page),
      totalPages,
      totalResults: count,
      results: products,
    };
    return results;
  } catch (error) {
    return {
      error: error,
    };
  }
};

const updateProduct = async (
  id,
  {
    isAkeneo_MapDiscount,
    isAkeneo_NetCost_Discount,
    MAP_Policy,
    Shipping_Cost,
    isShipping_Cost,
  }
) => {
  const updatedProduct = await Products.findByIdAndUpdate(
    id,
    {
      isAkeneo_MapDiscount,
      isAkeneo_NetCost_Discount,
      MAP_Policy,
      Shipping_Cost,
      isShipping_Cost,
    },
    { new: true }
  );

  return updatedProduct;
};
const updateCompetitionProduct = async (id, { competitionData }) => {
  console.log(competitionData, "--------competitionProduct");
  const updatedProductData = await Products.findByIdAndUpdate(
    id,
    { $set: { competitionData: competitionData } },
    { new: true }
  );

  return updatedProductData;
};
const deleteProducts = async () => {
  try {
    // Delete all products from the "Products" collection
    await Products.deleteMany();

    console.log("All products deleted successfully.");
  } catch (error) {
    console.error("Error deleting products:", error);
  }
};

const productSelectStatus = async ({ akeneoStatus = false, id }) => {
  const updatedProduct = await Products.findByIdAndUpdate(
    id,
    {
      $set: { akeneoStatus: akeneoStatus },
    },
    { new: true }
  );

  return updatedProduct;
};

const getProductsByStatus = async () => {
  const products = await Products.find({ akeneoStatus: true });
  return products;
};

const setAllAkeneoStatusToFalse = async () => {
  try {
    const updatedProducts = await Products.updateMany(
      {},
      { $set: { akeneoStatus: false } }
    );

    return updatedProducts;
  } catch (error) {
    // Handle any errors that occur during the update
    console.error(error);
    throw error;
  }
};
const updateProductsWebsiteId = async (brandId, { competitionData }) => {
  try {
    const updatedProducts = await Products.updateMany(
      { Brand: brandId },
      { $set: { competitionData: competitionData } }
    );

    return updatedProducts;

    // const exist = await Products.updateMany(
    //   { Brand: brandId },
    //   { $unset: { competitionData: [] } }
    // );

    // return exist;
  } catch (error) {
    // Handle any errors that occur during the update
    console.error(error);
    throw error;
  }
};

const setSelectedSearchProducts = async (query) => {
  const {
    search = "",
    brandId = "",
    pricing_category = "",
    akeneoStatus = false,
    includeZeroPrice = false,
    hasPrice = false,
  } = query;
  const regex = new RegExp(search, "i");

  const searchQuery = {
    $or: [
      { Product_Name: regex },
      { SKU: regex },
      { Brand: regex },
      { Product_Type: regex },
      { Pricing_Category: regex },
    ],
  };

  console.log(brandId, pricing_category, "--------search");

  if (brandId !== "") {
    searchQuery.Brand = brandId;
  }

  if (pricing_category !== "") {
    searchQuery.Pricing_Category = pricing_category;
  }

  if (includeZeroPrice === "true") {
    searchQuery.Price = 0;
  }
  if (hasPrice === "true") {
    searchQuery.Price = { $gt: 0 }; // Include products with prices greater than 0
  }

  const updatedProducts = await Products.updateMany(searchQuery, {
    $set: { akeneoStatus: akeneoStatus }, // Update the akeneo_status field to true
  });
  const updatedProductData = await Products.find(searchQuery); // Retrieve the updated products

  return updatedProductData;
};

module.exports = {
  getProducts,
  getAllProducts,
  updateProduct,
  getZeroProducts,
  productSelectStatus,
  getProductsByStatus,
  setAllAkeneoStatusToFalse,
  updateProductsWebsiteId,
  updateCompetitionProduct,
  deleteProducts,
  setSelectedSearchProducts,
};
