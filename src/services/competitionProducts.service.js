const { CompetitonProducts, Products, ShippingRules } = require("../models");
const ApiError = require("../utils/ApiError");
const { calculateNetPrice } = require("./Calculations/NetCostCal");
const { competitionCalc } = require("./Calculations/competionCal");

const createCompetitionProducts = async (payload, productFields) => {
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

    let {
      netPrice,
      shippingCost,
      ourFees,
      minimumMargin,
      id,
      isRoundDown,
      isShipping_Cost,
      Dealer_NetCost_Discount,
    } = productFields;

    console.log(Dealer_NetCost_Discount);

    const updatedData = competitionCalc(
      netPrice,
      shippingCost,
      ourFees,
      minimumMargin,
      payload,
      isRoundDown,
      isShipping_Cost,
      Dealer_NetCost_Discount
    );

    console.log(updatedData.calculatedMargin, "Margin");

    // Insert the new competition products from the payload
    const result = await CompetitonProducts.insertMany(
      updatedData.updatedPayload
    );

    let finalPrice = isRoundDown
      ? updatedData.calculatedRoundedPrice
      : updatedData.calculatedPrice;

    console.log(finalPrice);

    let isAllProductsAvailable = true;

    for (let i = 0; i < payload.length; i++) {
      if (!payload[i].isProductAvailible) {
        isAllProductsAvailable = false;
        break;
      }
    }

    console.log(isAllProductsAvailable);

    if (finalPrice > 0 && !isAllProductsAvailable) {
      const product = await Products.findByIdAndUpdate(
        id,
        {
          Price: finalPrice,
          ProfitMargin: updatedData.calculatedMargin,
        },
        {
          new: true, // Return the updated product
        }
      );

      if (!product) {
        throw new ApiError("Product not found", 404);
      }
    } else {
      const shippingRules = await ShippingRules.find();
      const product = await Products.findById(id);
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
        MAP_Policy,
        isAkeneo_MapDiscount,
        Dealer_MapPrice,
        isShipping_Cost,
        maxMargin,
      } = product;

      let margin = minimumMargin;

      if (
        isAllProductsAvailable &&
        maxMargin !== "" &&
        maxMargin !== undefined &&
        maxMargin !== "0"
      ) {
        margin = maxMargin;
      }

      console.log(minimumMargin);

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
        margin,
        AdditionalFee,
        Shipping_Method,
        Shipping_Weight,
        shippingRules,
        isShipping_Cost
      );

      const calculatePrice = (value, price) => {
        const discounts = value.split("/");
        let newPrice = price;
        discounts.forEach((discount) => {
          const discountPercentage = Number(discount);
          const discountPrice = newPrice * (discountPercentage / 100);
          newPrice -= discountPrice;
        });
        return newPrice;
      };

      let Dealer_MapPriceCalc = calculatePrice(
        Dealer_MapPrice,
        product.List_Price
      );

      const map_price__discount = calculatePrice(
        Dealer_MapPrice,
        product.List_Price
      );

      let mapPrice =
        isAkeneo_MapDiscount === "true"
          ? product.MAP_Price
          : map_price__discount;

      // ////////------------------------------ Map Price Based Calculations END--------------------------------///////

      const numericTotalCost = parseFloat(netPriceResult.totalCost);
      // if (MAP_Policy === "true") {
      //   if (mapPrice) {
      //     const numericMapPrice = parseFloat(mapPrice);

      //     const mapMargin =
      //       ((numericMapPrice - numericTotalCost) / numericMapPrice) * 100;

      //     if (mapMargin >= 0 && mapMargin < minimumMargin) {
      //       netPriceResult.sellingPrice =
      //         numericTotalCost / (1 - minimumMargin / 100);
      //     } else {
      //       netPriceResult.sellingPrice = numericMapPrice;
      //       netPriceResult.marginProfit = Math.max(mapMargin, minimumMargin);
      //     }

      //     if (
      //       (product.MAP_Price === "" && Dealer_MapPriceCalc === "") ||
      //       product.MAP_Price === 0 ||
      //       product.MAP_Price === undefined
      //     ) {
      //       netPriceResult.marginProfit = 0;
      //       netPriceResult.sellingPrice = 0;
      //     }
      //   }
      // } else {
      //   netPriceResult.sellingPrice =
      //     numericTotalCost / (1 - minimumMargin / 100);
      //   netPriceResult.marginProfit = minimumMargin;
      // }

      if (
        (Net_Cost === "" && Dealer_NetCost_Discount === "") ||
        List_Price === "" ||
        (Number(Net_Cost) === 0 && Dealer_NetCost_Discount === 0) ||
        Number(List_Price) === 0 ||
        (Net_Cost === undefined && Dealer_NetCost_Discount === undefined) ||
        List_Price === undefined ||
        (netPriceResult.totalShiping === 0 && isShipping_Cost === "true") ||
        (netPriceResult.totalShiping === "" && isShipping_Cost === "true") ||
        (netPriceResult.totalShiping === undefined &&
          isShipping_Cost === "true")
      ) {
        netPriceResult.marginProfit = 0;
        netPriceResult.sellingPrice = 0;
      }

      const updatedFields = {
        Shipping_Cost: netPriceResult.totalShiping, // Round the shipping cost to 2 decimal places
        Freight_Class: netPriceResult.freightClassesString,
        Price: netPriceResult.sellingPrice,
        ProfitMargin: netPriceResult.marginProfit,
      };

      const updatedProduct = await Products.findByIdAndUpdate(
        id,
        updatedFields,
        {
          new: true, // Return the updated product
        }
      );
    }

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
