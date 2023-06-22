const { toJSON, diffHistory } = require("./plugins");
const softDelete = require("mongoose-delete");

module.exports = ({ Schema, Types, model }, mongoosePaginate) => {
  const Pricing_Category = new Schema(
    {
      brandId: { type: String, required: true },
      dealerDiscount: { type: String, required: true },
      pricing_category: { type: String, required: true },
      isAkeneo_MapDiscount: { type: String, required: true },
      isAkeneo_NetCost_Discount: { type: String, required: true },
      Dealer_MapPrice: { type: String, required: true },
      isShipping_Cost: { type: String, required: true },
      MAP_Policy: { type: String, required: true },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  Pricing_Category.plugin(softDelete, {
    deletedBy: true,
    deletedAt: true,
    overrideMethods: "all",
  });
  Pricing_Category.plugin(toJSON);
  Pricing_Category.plugin(mongoosePaginate);

  /**
   * @typedef LocalBrands
   */
  return model("Pricing_Category", Pricing_Category);
};
