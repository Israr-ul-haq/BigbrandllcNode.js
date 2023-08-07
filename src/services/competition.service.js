const ApiError = require("../utils/ApiError");
const { Competition, Products, CompetitonProducts } = require("../models");
const { competitionCalc } = require("./Calculations/competionCal");
const { totalAdd } = require("./Calculations/TotalAdditional");
const createCompetition = async ({ name, website }) => {
  const compete = await Competition.create({
    name,
    website,
  });
  return {
    status: 201,
    data: compete,
  };
};

const updateCompetition = async (id, updatedFields) => {
  try {
    const competitionData = await Competition.findByIdAndUpdate(
      id,
      updatedFields,
      {
        new: true, // Return the updated rule
      }
    );

    if (!competitionData) {
      throw new ApiError("comptition not found", 404);
    }
    const result = await Products.updateMany(
      { "competitionData.websiteId": id },
      {
        $set: {
          "competitionData.$.name": updatedFields.name,
          "competitionData.$.website": updatedFields.website,
        },
      }
    );

    console.log(`${result.nModified} product(s) updated successfully`);

    return {
      status: 200,
      data: competitionData,
    };
  } catch (error) {
    throw new ApiError("Failed to update competition", 500);
  }
};

const deleteCompetition = async (id) => {
  try {
    const data = await Competition.findByIdAndDelete(id);
    if (!data) {
      throw new ApiError("data not found", 404);
    }

    const result = await Products.updateMany(
      { "competitionData.websiteId": id },
      { $pull: { competitionData: { websiteId: id } } }
    );

    await CompetitonProducts.deleteMany({ websiteId: id });

    const competitionData = await CompetitonProducts.find();
    const productIdSet = new Set();

    competitionData.forEach((item) => {
      productIdSet.add(item.productId);
    });

    const productId = Array.from(productIdSet);

    const products = await Products.find({ SKU: { $in: productId } });

    let competeArray = [];

    let productsArray = [];

    products.map((i) => {
      let payload = competitionData.filter((data) => data.productId === i.SKU);

      let total = totalAdd(i);

      const updatedData = competitionCalc(
        i.Net_Cost,
        i.Shipping_Cost,
        total,
        i.minimumMargin,
        payload,
        i.isRoundDown,
        i.isShipping_Cost,
        i.Dealer_NetCost_Discount
      );

      updatedData.updatedPayload.forEach((obj) => {
        competeArray.push({
          updateOne: {
            filter: { _id: obj._doc._id },
            update: {
              $set: {
                totalPrice: obj.totalPrice,
                margin: obj.margin,
                result: obj.result,
                compete_lowest_price: obj.compete_lowest_price,
                compete_RoundedPrice: obj.compete_RoundedPrice,
                lowestMargin: obj.lowestMargin,
                minimumMargin: obj.minimumMargin,
                isUnderMargin: obj.isUnderMargin,
              },
            },
          },
        });
      });

      let finalPrice = i.isRoundDown
        ? updatedData.calculatedRoundedPrice
        : updatedData.calculatedPrice;

      console.log(i.id);

      productsArray.push({
        updateOne: {
          filter: { _id: i.id }, // Assuming i._id is the product's _id field
          update: {
            $set: { Price: finalPrice },
          },
        },
      });
    });

    // console.log(competeArray);

    await CompetitonProducts.bulkWrite(competeArray);
    await Products.bulkWrite(productsArray);

    return;
  } catch (error) {
    throw new ApiError("Failed to delete data", 500);
  }
};

module.exports = {
  createCompetition,
  updateCompetition,
  deleteCompetition,
};
