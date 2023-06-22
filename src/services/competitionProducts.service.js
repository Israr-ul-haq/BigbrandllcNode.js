const { CompetitonProducts } = require("../models");
const ApiError = require("../utils/ApiError");

const createCompetitionProducts = async (payload) => {
  try {
    // Extract the unique brandId, websiteId, and productId values from the payload
    const uniqueIds = [
      ...new Set(
        payload.map((product) =>
          JSON.stringify({
            brandId: product.brandId,
            websiteId: product.websiteId,
            productId: product.productId,
          })
        )
      ),
    ].map((item) => JSON.parse(item));

    // Delete competition products with the specified brandId, websiteId, and productId
    await CompetitonProducts.deleteMany({ $or: uniqueIds });

    // Insert the new competition products from the payload
    const result = await CompetitonProducts.insertMany(payload);

    return {
      status: 201,
      data: result,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getCompetitionProducts = async (brandId, websiteId, productId) => {
  console.log(brandId, websiteId, productId);

  const competitionProducts = await CompetitonProducts.find({
    brandId,
    websiteId: { $in: websiteId },
    productId,
  });

  if (competitionProducts.length === 0) {
    return {
      status: 404,
      message: "Products not found",
    };
  }

  return {
    status: 201,
    data: competitionProducts,
  };
};

module.exports = {
  createCompetitionProducts,
  getCompetitionProducts,
};
