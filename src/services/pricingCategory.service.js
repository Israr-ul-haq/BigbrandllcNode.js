const httpStatus = require("http-status"),
  {
    Pricing_Category,
    Products,
    ShippingRules,
    CompetitonProducts,
  } = require("@models"),
  ApiError = require("@utils/ApiError"),
  customLabels = require("@utils/customLabels"),
  defaultSort = require("@utils/defaultSort");
const { calculateNetPrice } = require("./Calculations/NetCostCal");
const { competitionCalc } = require("./Calculations/competionCal");
const { totalAdd } = require("./Calculations/TotalAdditional");

/**
 * Get Pricing_Category
 * @param {ObjectId} brandId
 * @returns {Promise<Pricing_Category[]>}
 * @throws {ApiError}
 */
const getPricingCategory = async (brandId, client_secret) => {
  const products = await Products.find({
    Brand: brandId,
    sourceId: client_secret,
  });

  const categoryCounts = {};

  // Iterate over the products and count the number of products in each pricing category
  products.forEach((product) => {
    const {
      Pricing_Category,
      Map_Price_percentage,
      Net_Cost_percentage,
      isAkeneo_NetCost_Discount,
      isAkeneo_MapDiscount,
      isShipping_Cost,
      MAP_Policy,
      Dealer_NetCost_Discount,
      Dealer_MapPrice,
      is_Quarterly_Rebate,
      is_Quarterly_Volume_Based_Rebate,
      Quarterly_Rebate_Percentage,
      is_Annual_Rebate,
      is_Annual_Volume_Based_Rebate,
      Annual_Rebate_Percentage,
      AdditionalFee,
      isVendorRules,
      vendorRulePrice,
      vendorRulePrice_Percentage,
      minimumMargin,
      TotalAdditionalFeePercentage,
      TotalAdditionalFeePrice,
      competitionData,
      maxMargin,
      isRoundDown,
    } = product;
    if (categoryCounts[Pricing_Category]) {
      categoryCounts[Pricing_Category].count++;
    } else {
      categoryCounts[Pricing_Category] = {
        count: 1,
        Map_Price_percentage,
        Net_Cost_percentage,
        isAkeneo_NetCost_Discount,
        isAkeneo_MapDiscount,
        isShipping_Cost,
        MAP_Policy,
        Dealer_NetCost_Discount,
        Dealer_MapPrice,
        is_Quarterly_Rebate,
        is_Quarterly_Volume_Based_Rebate,
        Quarterly_Rebate_Percentage,
        is_Annual_Rebate,
        is_Annual_Volume_Based_Rebate,
        Annual_Rebate_Percentage,
        AdditionalFee,
        isVendorRules,
        vendorRulePrice,
        vendorRulePrice_Percentage,
        minimumMargin,
        TotalAdditionalFeePercentage,
        TotalAdditionalFeePrice,
        competitionData,
        maxMargin,
        isRoundDown,
      };
    }
  });

  // Create an array of objects containing the pricing category, count, Dealer_NetCost_Discount, and Dealer_MapPrice
  const result = Object.entries(categoryCounts).map(
    ([
      category,
      {
        count,
        Map_Price_percentage,
        Net_Cost_percentage,
        isAkeneo_MapDiscount,
        isAkeneo_NetCost_Discount,
        isShipping_Cost,
        MAP_Policy,
        Dealer_NetCost_Discount,
        Dealer_MapPrice,
        is_Quarterly_Rebate,
        is_Quarterly_Volume_Based_Rebate,
        Quarterly_Rebate_Percentage,
        is_Annual_Rebate,
        is_Annual_Volume_Based_Rebate,
        Annual_Rebate_Percentage,
        AdditionalFee,
        isVendorRules,
        vendorRulePrice,
        vendorRulePrice_Percentage,
        minimumMargin,
        TotalAdditionalFeePercentage,
        TotalAdditionalFeePrice,
        competitionData,
        maxMargin,
        isRoundDown,
      },
    ]) => ({
      category,
      count,
      Map_Price_percentage,
      Net_Cost_percentage,
      isAkeneo_MapDiscount,
      isAkeneo_NetCost_Discount,
      isShipping_Cost,
      MAP_Policy,
      Dealer_NetCost_Discount,
      Dealer_MapPrice,
      is_Quarterly_Rebate,
      is_Quarterly_Volume_Based_Rebate,
      Quarterly_Rebate_Percentage,
      is_Annual_Rebate,
      is_Annual_Volume_Based_Rebate,
      Annual_Rebate_Percentage,
      AdditionalFee,
      isVendorRules,
      vendorRulePrice,
      vendorRulePrice_Percentage,
      minimumMargin,
      TotalAdditionalFeePercentage,
      TotalAdditionalFeePrice,
      competitionData,
      maxMargin,
      isRoundDown,
    })
  );

  return result;
};

/**
 * update a Contact
 * @param { Object } contactBody
 * @returns {Promise<Pricing_Category>}
 * @throws {ApiError}
 */
const updatePricingCategory = async ({
  brandId,
  dealerDiscount,
  pricing_category,
  MAP_Policy,
  isAkeneo_NetCost_Discount,
  isAkeneo_MapDiscount,
  isShipping_Cost,
  Dealer_MapPrice,
  is_Quarterly_Rebate,
  is_Quarterly_Volume_Based_Rebate,
  Quarterly_Rebate_Percentage,
  is_Annual_Rebate,
  is_Annual_Volume_Based_Rebate,
  Annual_Rebate_Percentage,
  AdditionalFee,
  isVendorRules,
  vendorRulePrice,
  vendorRulePrice_Percentage,
  minimumMargin,
  TotalAdditionalFeePercentage,
  TotalAdditionalFeePrice,
  isRoundDown,
  maxMargin,
  sourceId,
}) => {
  ////GETTING THE PRODUCTS BY BRAND AND CATEGORY
  const products = await Products.find({
    Brand: brandId,
    sourceId: sourceId,
    Pricing_Category: { $ne: "", $eq: pricing_category },
  });

  ///CALCULATE PRICE WITH DISCOUNT
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

  //// Calculate Rebate Of product
  const calculateRebate = (netCost, rebate) => {
    const rebateAmount = (rebate / 100) * netCost;
    return rebateAmount;
  };

  const response = {
    brandId,
    dealerDiscount,
    pricing_category,
    MAP_Policy,
    isAkeneo_NetCost_Discount,
    isAkeneo_MapDiscount,
    isShipping_Cost,
    Dealer_MapPrice,
    is_Quarterly_Rebate,
    is_Quarterly_Volume_Based_Rebate,
    Quarterly_Rebate_Percentage,
    is_Annual_Rebate,
    is_Annual_Volume_Based_Rebate,
    Annual_Rebate_Percentage,
    AdditionalFee,
    isVendorRules,
    vendorRulePrice,
    vendorRulePrice_Percentage,
    minimumMargin,
    TotalAdditionalFeePercentage,
    TotalAdditionalFeePrice,
    isRoundDown,
    maxMargin,
  };

  const shippingRules = await ShippingRules.find();

  const competitionProducts = await CompetitonProducts.find();


  const bulkOperations = products.map((product) => {
    ////If the competition product all fields are disabled then there will be max margin
    ////--------start-----/////
    const filteredCompetitions = competitionProducts.filter(
      (i) =>
        i.productId === product.SKU &&
        i.compete_RoundedPrice !== "0" &&
        i.compete_lowest_price !== "0"
    );

    let isAllProductsAvailable = true;

    for (let i = 0; i < filteredCompetitions.length; i++) {
      if (!filteredCompetitions[i].isProductAvailible) {
        isAllProductsAvailable = false;
        break;
      }
    }

    let margin = minimumMargin;

    if (
      isAllProductsAvailable &&
      maxMargin !== "" &&
      maxMargin !== undefined &&
      maxMargin !== "0"
    ) {
      margin = maxMargin;
    }
    /////------end------/////

    let List_Price = product.List_Price;
    let Net_Cost = product.Net_Cost;

    let Shipping_Method = product.Shipping_Method;
    let Shipping_Weight = product.Shipping_Weight;

    let Dealer_NetCost_Discount = calculatePrice(
      dealerDiscount,
      product.List_Price
    );

    /////-----------min margin calculations ---start -----------------/////

    let Dealer_MapPriceCalc = calculatePrice(
      Dealer_MapPrice,
      product.List_Price
    );

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

    ///   competition calculation
    let payload = competitionProducts.filter(
      (data) => data.productId === product.SKU
    );

    let total = totalAdd(product);

    const updatedData = competitionCalc(
      product.Net_Cost,
      netPriceResult.totalShiping,
      total,
      minimumMargin,
      payload,
      product.isRoundDown,
      isShipping_Cost,
      Dealer_NetCost_Discount
    );

    let finalPrice = product.isRoundDown
      ? updatedData.calculatedRoundedPrice
      : updatedData.calculatedPrice;

    console.log(finalPrice);

    //////-------end-----////

    if (finalPrice > 0 && !isAllProductsAvailable) {
      netPriceResult.sellingPrice = finalPrice;
      netPriceResult.marginProfit = updatedData.calculatedMargin;
    } else {
      // ////////------------------Map Price Based Calculations START--------------------------------////

      const map_price__discount = calculatePrice(
        Dealer_MapPrice,
        product.List_Price
      );

      let mapPrice =
        isAkeneo_MapDiscount === "true"
          ? product.MAP_Price
          : map_price__discount;

      const numericTotalCost = parseFloat(netPriceResult.totalCost);
      if (MAP_Policy === "true") {
        if (mapPrice) {
          const numericMapPrice = parseFloat(mapPrice);

          const mapMargin =
            ((numericMapPrice - numericTotalCost) / numericMapPrice) * 100;

          if (mapMargin >= 0 && mapMargin < margin) {
            netPriceResult.sellingPrice = numericTotalCost / (1 - margin / 100);
          } else {
            netPriceResult.sellingPrice = numericMapPrice;
            netPriceResult.marginProfit = Math.max(mapMargin, margin);
          }

          if (
            (product.MAP_Price === "" && Dealer_MapPriceCalc === "") ||
            product.MAP_Price === 0 ||
            product.MAP_Price === undefined
          ) {
            netPriceResult.marginProfit = 0;
            netPriceResult.sellingPrice = 0;
          }
        }
      } else {
        netPriceResult.sellingPrice = numericTotalCost / (1 - margin / 100);
        netPriceResult.marginProfit = margin;
      }
      // ////////------------------------------ Map Price Based Calculations END--------------------------------///////

      // if (filteredCompetitions.length > 0) {
      //   const firstCompetition = filteredCompetitions[0];

      //   if (isRoundDown) {
      //     if (
      //       parseFloat(firstCompetition.compete_RoundedPrice) >
      //       parseFloat(netPriceResult.sellingPrice)
      //     ) {
      //       netPriceResult.sellingPrice = firstCompetition.compete_RoundedPrice;
      //       netPriceResult.marginProfit = firstCompetition.lowestMargin;
      //     }
      //   } else {
      //     if (
      //       parseFloat(firstCompetition.compete_lowest_price) >
      //       parseFloat(netPriceResult.sellingPrice)
      //     ) {
      //       netPriceResult.sellingPrice = firstCompetition.compete_lowest_price;
      //       netPriceResult.marginProfit = firstCompetition.lowestMargin;

      //       console.log(netPriceResult.sellingPrice);
      //     }
      //   }
      // }
    }

    ////////////-------------END -------------------------///

    if (
      (Net_Cost === "" && Dealer_NetCost_Discount === "") ||
      List_Price === "" ||
      (Number(Net_Cost) === 0 && Dealer_NetCost_Discount === 0) ||
      Number(List_Price) === 0 ||
      (Net_Cost === undefined && Dealer_NetCost_Discount === undefined) ||
      List_Price === undefined ||
      (netPriceResult.totalShiping === 0 && isShipping_Cost === "true") ||
      (netPriceResult.totalShiping === "" && isShipping_Cost === "true") ||
      (netPriceResult.totalShiping === undefined && isShipping_Cost === "true")
    ) {
      netPriceResult.marginProfit = 0;
      netPriceResult.sellingPrice = 0;
    }

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            Dealer_NetCost_Discount: Dealer_NetCost_Discount,
            Dealer_MapPrice: Dealer_MapPriceCalc,
            MAP_Policy: MAP_Policy,
            isAkeneo_NetCost_Discount: isAkeneo_NetCost_Discount,
            isAkeneo_MapDiscount: isAkeneo_MapDiscount,
            isShipping_Cost: isShipping_Cost,
            Map_Price_percentage: Dealer_MapPrice,
            Net_Cost_percentage: dealerDiscount,
            is_Quarterly_Rebate: is_Quarterly_Rebate,
            is_Quarterly_Volume_Based_Rebate: is_Quarterly_Volume_Based_Rebate,
            Quarterly_Rebate_Percentage: Quarterly_Rebate_Percentage,
            Quarterly_Rebate: calculateRebate(
              netPriceResult.rebateArg,
              Quarterly_Rebate_Percentage
            ),
            Annual_Rebate: calculateRebate(
              netPriceResult.rebateArg,
              Annual_Rebate_Percentage
            ),
            Annual_Rebate_Percentage: Annual_Rebate_Percentage,
            is_Annual_Rebate: is_Annual_Rebate,
            is_Annual_Volume_Based_Rebate: is_Annual_Volume_Based_Rebate,
            AdditionalFee: netPriceResult.updatedAdditionalFees,
            isVendorRules: isVendorRules,
            vendorRulePrice: vendorRulePrice,
            vendorRulePrice_Percentage: vendorRulePrice_Percentage,
            Shipping_Cost: netPriceResult.totalShiping,
            minimumMargin: minimumMargin,
            TotalAdditionalFeePercentage: TotalAdditionalFeePercentage,
            TotalAdditionalFeePrice: TotalAdditionalFeePrice,
            FinalTotalAdditionalFeePrice: netPriceResult.result,
            Price: netPriceResult.sellingPrice.toString(),
            ProfitMargin: netPriceResult.marginProfit,
            Freight_Class: netPriceResult.freightClassesString,
            isRoundDown: isRoundDown,
            maxMargin: maxMargin,
          },
        },
      },
    };
  });
  await Products.bulkWrite(bulkOperations);

  return response;
};

module.exports = {
  getPricingCategory,
  updatePricingCategory,
};
