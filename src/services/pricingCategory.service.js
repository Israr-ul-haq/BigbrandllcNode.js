const httpStatus = require("http-status"),
  { Pricing_Category, Products, ShippingRules } = require("@models"),
  ApiError = require("@utils/ApiError"),
  customLabels = require("@utils/customLabels"),
  defaultSort = require("@utils/defaultSort");
const { calculateNetPrice } = require("./Calculations/NetCostCal");

/**
 * Get Pricing_Category
 * @param {ObjectId} brandId
 * @returns {Promise<Pricing_Category[]>}
 * @throws {ApiError}
 */
const getPricingCategory = async (brandId) => {
  const products = await Products.find({
    Brand: brandId,
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
}) => {
  ////GETTING THE PRODUCTS BY BRAND AND CATEGORY
  const products = await Products.find({
    Brand: brandId,
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
  };

  const shippingRules = await ShippingRules.find();

  const bulkOperations = products.map((product) => {
    /// the rebate is depend on the NetCost or akenoe

    let List_Price = product.List_Price;
    let Net_Cost = product.Net_Cost;

    let Shipping_Method = product.Shipping_Method;
    let Shipping_Weight = product.Shipping_Weight;

    let Dealer_NetCost_Discount = calculatePrice(
      dealerDiscount,
      product.List_Price
    );

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
      minimumMargin,
      AdditionalFee,
      Shipping_Method,
      Shipping_Weight,
      shippingRules
    );

    // ////////------------------Map Price Based Calculations START--------------------------------////

    const map_price__discount = calculatePrice(
      Dealer_MapPrice,
      product.List_Price
    );

    let mapPrice =
      isAkeneo_MapDiscount === "true" ? product.MAP_Price : map_price__discount;

    // ////////------------------------------ Map Price Based Calculations END--------------------------------///////

    const numericTotalCost = parseFloat(netPriceResult.totalCost);
    if (MAP_Policy === "true") {
      if (mapPrice) {
        const numericMapPrice = parseFloat(mapPrice);

        const mapMargin =
          ((numericMapPrice - numericTotalCost) / numericMapPrice) * 100;

        if (mapMargin >= 0 && mapMargin < minimumMargin) {
          netPriceResult.sellingPrice =
            numericTotalCost / (1 - minimumMargin / 100);
        } else {
          netPriceResult.sellingPrice = numericMapPrice;
          netPriceResult.marginProfit = Math.max(mapMargin, minimumMargin);
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
      netPriceResult.sellingPrice =
        numericTotalCost / (1 - minimumMargin / 100);
      netPriceResult.marginProfit = minimumMargin;
    }

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
            Price: netPriceResult.sellingPrice,
            ProfitMargin: netPriceResult.marginProfit,
            Freight_Class: netPriceResult.freightClassesString,
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
