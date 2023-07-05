const { ShippingRules, Products } = require("../models");
const ApiError = require("../utils/ApiError");
const { calculateNetPrice } = require("./Calculations/NetCostCal");

/**
 * Create a Reule
 * @param { Object } contactBody
 * @returns {Promise<ShippingRules>}
 * @throws {ApiError}
 */
const createRule = async ({
  freightClass,
  weightFrom,
  weightTo,
  shippingCost,
}) => {
  const shipping = await ShippingRules.create({
    freightClass,
    weightFrom,
    weightTo,
    shippingCost,
  });

  const products = await Products.find({
    isVendorRules: false,
    minimumMargin: { $nin: ["", undefined, "0", 0] },
  });

  const shippingRules = await ShippingRules.find();

  const bulkWrite = products.map((product) => {
    if (
      product.minimumMargin !== "" &&
      product.minimumMargin !== undefined &&
      product.minimumMargin !== "0" &&
      product.minimumMargin !== 0
    ) {
      let {
        Shipping_Weight,
        List_Price,
        Shipping_Method,
        isAkeneo_NetCost_Discount,
        TotalAdditionalFeePercentage,
        TotalAdditionalFeePrice,
        vendorRulePrice,
        vendorRulePrice_Percentage,
        isVendorRules,
        minimumMargin,
        AdditionalFee,
        Dealer_NetCost_Discount,
      } = product;

      let dealerDiscount = product.Net_Cost_percentage;
      let Net_Cost = product.Net_Cost;

      const netPriceResult = calculateNetPrice(
        dealerDiscount,
        List_Price,
        isAkeneo_NetCost_Discount,
        Net_Cost,
        TotalAdditionalFeePercentage,
        TotalAdditionalFeePrice,
        vendorRulePrice,
        vendorRulePrice_Percentage,
        isVendorRules,
        minimumMargin,
        AdditionalFee,
        Shipping_Method,
        Shipping_Weight,
        shippingRules
      );
      if (
        (Net_Cost === "" && Dealer_NetCost_Discount === "") ||
        List_Price === "" ||
        (Number(Net_Cost) === 0 && Dealer_NetCost_Discount === 0) ||
        Number(List_Price) === 0 ||
        (Net_Cost === undefined && Dealer_NetCost_Discount === undefined) ||
        List_Price === undefined ||
        netPriceResult.totalShiping === 0 ||
        netPriceResult.totalShiping === "" ||
        netPriceResult.totalShiping === undefined
      ) {
        netPriceResult.marginProfit = 0;
        netPriceResult.sellingPrice = 0;
      }

      return {
        updateOne: {
          filter: { _id: product._id },
          update: {
            $set: {
              Shipping_Cost: netPriceResult.totalShiping, // Round the shipping cost to 2 decimal places
              Freight_Class: netPriceResult.freightClassesString,
              Price: netPriceResult.sellingPrice,
            },
          },
          upsert: false,
        },
      };
    }
  });

  console.log(bulkWrite);

  await Products.bulkWrite(bulkWrite);

  return {
    status: 201,
    data: shipping,
  };
};

/**
 * Update a Rule
 * @param {string} ruleId - The ID of the rule to update
 * @param {Object} updatedFields - The updated fields for the rule
 * @returns {Promise<ShippingRules>}
 * @throws {ApiError}
 */
const updateRule = async (ruleId, updatedFields) => {
  try {
    const shipping = await ShippingRules.findByIdAndUpdate(
      ruleId,
      updatedFields,
      {
        new: true, // Return the updated rule
      }
    );

    if (!shipping) {
      throw new ApiError("Shipping rule not found", 404);
    }

    const products = await Products.find({
      isVendorRules: false,
      minimumMargin: { $nin: ["", undefined, "0", 0] },
    });

    const shippingRules = await ShippingRules.find();

    const bulkWrite = products.map((product) => {
      if (
        product.minimumMargin !== "" &&
        product.minimumMargin !== undefined &&
        product.minimumMargin !== "0" &&
        product.minimumMargin !== 0
      ) {
        let {
          Shipping_Weight,
          List_Price,
          Shipping_Method,
          isAkeneo_NetCost_Discount,
          TotalAdditionalFeePercentage,
          TotalAdditionalFeePrice,
          vendorRulePrice,
          vendorRulePrice_Percentage,
          isVendorRules,
          minimumMargin,
          AdditionalFee,
          Dealer_NetCost_Discount,
        } = product;

        let dealerDiscount = product.Net_Cost_percentage;
        let Net_Cost = product.Net_Cost;

        const netPriceResult = calculateNetPrice(
          dealerDiscount,
          List_Price,
          isAkeneo_NetCost_Discount,
          Net_Cost,
          TotalAdditionalFeePercentage,
          TotalAdditionalFeePrice,
          vendorRulePrice,
          vendorRulePrice_Percentage,
          isVendorRules,
          minimumMargin,
          AdditionalFee,
          Shipping_Method,
          Shipping_Weight,
          shippingRules
        );
        if (
          (Net_Cost === "" && Dealer_NetCost_Discount === "") ||
          List_Price === "" ||
          (Number(Net_Cost) === 0 && Dealer_NetCost_Discount === 0) ||
          Number(List_Price) === 0 ||
          (Net_Cost === undefined && Dealer_NetCost_Discount === undefined) ||
          List_Price === undefined ||
          netPriceResult.totalShiping === 0 ||
          netPriceResult.totalShiping === "" ||
          netPriceResult.totalShiping === undefined
        ) {
          netPriceResult.marginProfit = 0;
          netPriceResult.sellingPrice = 0;
        }

        return {
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                Shipping_Cost: netPriceResult.totalShiping, // Round the shipping cost to 2 decimal places
                Freight_Class: netPriceResult.freightClassesString,
                Price: netPriceResult.sellingPrice,
              },
            },
            upsert: false,
          },
        };
      }
    });

    console.log(bulkWrite);

    await Products.bulkWrite(bulkWrite);

    return {
      status: 200,
      data: shipping,
    };
  } catch (error) {
    throw new ApiError("Failed to update shipping rule", 500);
  }
};

/**
 * Delete a Rule
 * @param {string} ruleId - The ID of the rule to delete
 * @returns {Promise<void>}
 * @throws {ApiError}
 */
const deleteRule = async (ruleId) => {
  try {
    const deletedRule = await ShippingRules.findByIdAndDelete(ruleId);

    if (!deletedRule) {
      throw new ApiError("Shipping rule not found", 404);
    }

    const products = await Products.find({
      isVendorRules: false,
      minimumMargin: { $nin: ["", undefined, "0", 0] },
    });

    const shippingRules = await ShippingRules.find();

    const bulkWrite = products.map((product) => {
      if (
        product.minimumMargin !== "" &&
        product.minimumMargin !== undefined &&
        product.minimumMargin !== "0" &&
        product.minimumMargin !== 0
      ) {
        let {
          Shipping_Weight,
          List_Price,
          Shipping_Method,
          isAkeneo_NetCost_Discount,
          TotalAdditionalFeePercentage,
          TotalAdditionalFeePrice,
          vendorRulePrice,
          vendorRulePrice_Percentage,
          isVendorRules,
          minimumMargin,
          AdditionalFee,
          Dealer_NetCost_Discount,
        } = product;

        let dealerDiscount = product.Net_Cost_percentage;
        let Net_Cost = product.Net_Cost;

        const netPriceResult = calculateNetPrice(
          dealerDiscount,
          List_Price,
          isAkeneo_NetCost_Discount,
          Net_Cost,
          TotalAdditionalFeePercentage,
          TotalAdditionalFeePrice,
          vendorRulePrice,
          vendorRulePrice_Percentage,
          isVendorRules,
          minimumMargin,
          AdditionalFee,
          Shipping_Method,
          Shipping_Weight,
          shippingRules
        );
        if (
          (Net_Cost === "" && Dealer_NetCost_Discount === "") ||
          List_Price === "" ||
          (Number(Net_Cost) === 0 && Dealer_NetCost_Discount === 0) ||
          Number(List_Price) === 0 ||
          (Net_Cost === undefined && Dealer_NetCost_Discount === undefined) ||
          List_Price === undefined ||
          netPriceResult.totalShiping === 0 ||
          netPriceResult.totalShiping === "" ||
          netPriceResult.totalShiping === undefined
        ) {
          netPriceResult.marginProfit = 0;
          netPriceResult.sellingPrice = 0;
        }

        return {
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                Shipping_Cost: netPriceResult.totalShiping, // Round the shipping cost to 2 decimal places
                Freight_Class: netPriceResult.freightClassesString,
                Price: netPriceResult.sellingPrice,
              },
            },
            upsert: false,
          },
        };
      }
    });

    console.log(bulkWrite);

    await Products.bulkWrite(bulkWrite);

    return {
      status: 200,
      message: "Shipping rule deleted successfully",
    };
  } catch (error) {
    throw new ApiError("Failed to delete shipping rule", 500);
  }
};

module.exports = {
  createRule,
  updateRule,
  deleteRule,
};
