const httpStatus = require("http-status"),
  { Pricing_Category, Products } = require("@models"),
  ApiError = require("@utils/ApiError"),
  customLabels = require("@utils/customLabels"),
  defaultSort = require("@utils/defaultSort");

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

  const bulkOperations = products.map((product) => {
    /// the rebate is depend on the NetCost or akenoe

    ///////////---------------------NetCost Base Calculations --------------------////////

    const dealerDiscountData = calculatePrice(
      dealerDiscount,
      product.List_Price
    );

    let rebateArg =
      isAkeneo_NetCost_Discount === "true"
        ? product.Net_Cost === ""
          ? 0
          : product.Net_Cost
        : dealerDiscountData;

    console.log(rebateArg, "------NetCost");

    //// geting total Additonal of Fee
    let CalculatePercentAdditional = calculateRebate(
      rebateArg,
      TotalAdditionalFeePercentage
    );

    let TotalAdditional = (
      parseFloat(TotalAdditionalFeePrice) +
      parseFloat(CalculatePercentAdditional)
    ).toString();
    let result = TotalAdditional;

    //// total shiping cost based on vendor price
    let totalShiping =
      vendorRulePrice !== ""
        ? vendorRulePrice
        : vendorRulePrice_Percentage !== ""
        ? calculateRebate(rebateArg, vendorRulePrice_Percentage)
        : "";

    ///if the vendor rule is false so totalShipping = 0
    if (isVendorRules === "false") {
      totalShiping = 0;
    }

    let totalCost =
      parseFloat(rebateArg) +
      parseFloat(totalShiping) +
      parseFloat(TotalAdditional);

    let sellingPrice = totalCost / (1 - minimumMargin / 100);
    let marginProfit = ((sellingPrice - totalCost) / sellingPrice) * 100;

    // caluclating the addtional fee in $ from netcost in an each Object
    const updatedAdditionalFees = AdditionalFee.map((fee) => {
      if (fee.percentage) {
        return {
          ...fee,
          calculatedPriceFromNetCost: calculateRebate(
            rebateArg,
            fee.percentage
          ),
        };
      } else {
        return {
          ...fee,
          calculatedPriceFromNetCost: "",
        };
      }
    });
    ///////////////-----------Net Cost Based Calculations END--------------------------------////////

    // ////////------------------Map Price Based Calculations START--------------------------------////

    const map_price__discount = calculatePrice(
      Dealer_MapPrice,
      product.List_Price
    );

    let mapPrice =
      isAkeneo_MapDiscount === "true" ? product.MAP_Price : map_price__discount;

    // ////////------------------------------ Map Price Based Calculations END--------------------------------///////

    console.log(mapPrice, "Map Price");
    console.log(totalCost, "Total Cost----");
    const numericTotalCost = parseFloat(totalCost);
    if (MAP_Policy === "true") {
      if (mapPrice) {
        const numericMapPrice = parseFloat(mapPrice);

        const mapMargin =
          ((numericMapPrice - numericTotalCost) / numericMapPrice) * 100;

        if (mapMargin >= 0 && mapMargin < minimumMargin) {
          sellingPrice = numericTotalCost / (1 - minimumMargin / 100);
        } else {
          sellingPrice = numericMapPrice;
          marginProfit = Math.max(mapMargin, minimumMargin);
        }
      }
    } else {
      sellingPrice = numericTotalCost / (1 - minimumMargin / 100);
      marginProfit = minimumMargin;
    }

    return {
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            Dealer_NetCost_Discount: calculatePrice(
              dealerDiscount,
              product.List_Price
            ),
            Dealer_MapPrice: calculatePrice(
              Dealer_MapPrice,
              product.List_Price
            ),
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
              rebateArg,
              Quarterly_Rebate_Percentage
            ),
            Annual_Rebate: calculateRebate(rebateArg, Annual_Rebate_Percentage),
            Annual_Rebate_Percentage: Annual_Rebate_Percentage,
            is_Annual_Rebate: is_Annual_Rebate,
            is_Annual_Volume_Based_Rebate: is_Annual_Volume_Based_Rebate,
            AdditionalFee: updatedAdditionalFees,
            isVendorRules: isVendorRules,
            vendorRulePrice: vendorRulePrice,
            vendorRulePrice_Percentage: vendorRulePrice_Percentage,
            Shipping_Cost: totalShiping,
            minimumMargin: minimumMargin,
            TotalAdditionalFeePercentage: TotalAdditionalFeePercentage,
            TotalAdditionalFeePrice: TotalAdditionalFeePrice,
            FinalTotalAdditionalFeePrice: result,
            Price: sellingPrice,
            ProfitMargin: marginProfit,
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
