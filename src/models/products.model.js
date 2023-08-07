const { toJSON, diffHistory } = require("./plugins");
const softDelete = require("mongoose-delete");

module.exports = ({ Schema, Types, model }, mongoosePaginate) => {
  const Products = new Schema(
    {
      image: { type: String },
      items_count: { type: String },
      token: { type: String },
      Product_Name: { type: String },
      SKU: { type: String },
      Brand: { type: String },
      Product_Type: { type: String },
      Shipping_Method: { type: String },
      Shipping_Weight: { type: String },
      Shipping_Width: { type: String },
      Shipping_Depth: { type: String },
      Shipping_Cost: { type: String },
      Shipping_Height: { type: String },
      Freight_Class: { type: String },
      Pricing_Category: { type: String },
      Price: { type: String },
      List_Price: { type: String },
      Net_Cost: { type: String },
      MAP_Price: { type: String },
      MAP_Policy: { type: String },
      Dealer_NetCost_Discount: { type: String },
      Dealer_MapPrice: { type: String },
      isAkeneo_NetCost_Discount: { type: String },
      isAkeneo_MapDiscount: { type: String },
      isShipping_Cost: { type: String },
      Net_Cost_percentage: { type: String },
      Map_Price_percentage: { type: String },
      is_Quarterly_Rebate: { type: String },
      is_Quarterly_Volume_Based_Rebate: { type: String },
      Quarterly_Rebate: { type: String },
      Quarterly_Rebate_Percentage: { type: String },
      is_Annual_Rebate: { type: String },
      is_Annual_Volume_Based_Rebate: { type: String },
      Annual_Rebate_Percentage: { type: String },
      Annual_Rebate: { type: String },
      AdditionalFee: { type: Array },
      isVendorRules: { type: String },
      vendorRulePrice: { type: String },
      vendorRulePrice_Percentage: { type: String },
      minimumMargin: { type: String },
      TotalAdditionalFeePrice: { type: String },
      TotalAdditionalFeePercentage: { type: String },
      FinalTotalAdditionalFeePrice: { type: String },
      ProfitMargin: { type: String },
      competitionData: { type: Array },
      akeneoStatus: { type: Boolean },
      isRoundDown: { type: Boolean },
      maxMargin: { type: String },
      sourceId: { type: String },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );
  Products.plugin(softDelete, {
    deletedBy: true,
    deletedAt: true,
    overrideMethods: "all",
  });
  Products.plugin(toJSON);
  Products.plugin(mongoosePaginate);

  /**
   * @typedef Products
   */
  return model("Products", Products);
};
