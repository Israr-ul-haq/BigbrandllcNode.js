const { ShippingRules, Products } = require("../models");
const ApiError = require("../utils/ApiError");

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

  // const products = await Products.find({ isVendorRules: "false" });

  // const bulkWrite = products.map((product) => {
  //   const { Shipping_Weight, Shipping_Cost, Freight_Class } = product;

  //   const ruleWeightFrom = parseFloat(weightFrom);
  //   const ruleWeightTo = parseFloat(weightTo);
  //   const ruleShippingCost = parseFloat(shippingCost);

  //   if (
  //     parseFloat(Shipping_Weight) >= ruleWeightFrom &&
  //     parseFloat(Shipping_Weight) <= ruleWeightTo
  //   ) {
  //     const updatedShippingCost =
  //       parseFloat(Shipping_Cost) + parseFloat(ruleShippingCost);

  //     product.Shipping_Cost = updatedShippingCost;
  //     product.Freight_Class = Freight_Class
  //       ? `${Freight_Class}, ${freightClass}`
  //       : freightClass;
  //   }

  //   return {
  //     updateOne: {
  //       filter: { _id: product._id },
  //       update: {
  //         $set: {
  //           Shipping_Cost: parseFloat(product.Shipping_Cost), // Round the shipping cost to 2 decimal places
  //           Freight_Class: product.Freight_Class,
  //         },
  //       },
  //       upsert: false,
  //     },
  //   };
  // });

  // await Products.bulkWrite(bulkWrite);

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

    // // Retrieve products without vendor rules
    // const products = await Products.find({ isVendorRules: "false" });
    // const FreightShippingRules = await ShippingRules.find();

    // const bulkWrite = products.map((product) => {
    //   let freightClasses = [];
    //   let totalShippingCost = 0; // Initialize the total shipping cost
    //   const { Shipping_Weight } = product;

    //   FreightShippingRules.forEach((rule) => {
    //     const ruleWeightFrom = parseFloat(rule.weightFrom);
    //     const ruleWeightTo = parseFloat(rule.weightTo);
    //     const ruleShippingCost = parseFloat(rule.shippingCost);

    //     if (
    //       parseFloat(Shipping_Weight) >= ruleWeightFrom &&
    //       parseFloat(Shipping_Weight) <= ruleWeightTo
    //     ) {
    //       totalShippingCost += ruleShippingCost;
    //       freightClasses.push(rule.freightClass);
    //     }
    //   });

    //   product.Shipping_Cost = totalShippingCost;
    //   product.Freight_Class = freightClasses.join(", ");

    //   return {
    //     updateOne: {
    //       filter: { _id: product._id },
    //       update: {
    //         $set: {
    //           Shipping_Cost: parseFloat(product.Shipping_Cost),
    //           Freight_Class: product.Freight_Class,
    //         },
    //       },
    //       upsert: false,
    //     },
    //   };
    // });

    // await Products.bulkWrite(bulkWrite);

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

    // const products = await Products.find({ isVendorRules: "false" });
    // const FreightShippingRules = await ShippingRules.find();
    // const bulkWrite = products.map((product) => {
    //   const { Freight_Class, Shipping_Cost } = product;

    //   let updatedShippingCost = parseFloat(Shipping_Cost);
    //   let updatedFreightClass = Freight_Class;

    //   FreightShippingRules.forEach((rule) => {
    //     const ruleWeightFrom = parseFloat(rule.weightFrom);
    //     const ruleWeightTo = parseFloat(rule.weightTo);
    //     const ruleShippingCost = parseFloat(rule.shippingCost);

    //     if (
    //       parseFloat(product.Shipping_Weight) >= ruleWeightFrom &&
    //       parseFloat(product.Shipping_Weight) <= ruleWeightTo
    //     ) {
    //       updatedShippingCost -= ruleShippingCost;
    //       updatedFreightClass = updatedFreightClass
    //         .split(", ")
    //         .filter((fc) => fc !== rule.freightClass)
    //         .join(", ");
    //     }
    //   });

    //   return {
    //     updateOne: {
    //       filter: { _id: product._id },
    //       update: {
    //         $set: {
    //           Shipping_Cost: parseFloat(updatedShippingCost),
    //           Freight_Class: updatedFreightClass,
    //         },
    //       },
    //       upsert: false,
    //     },
    //   };
    // });

    // await Products.bulkWrite(bulkWrite);

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
