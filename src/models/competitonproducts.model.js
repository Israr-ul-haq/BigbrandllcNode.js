const { toJSON, diffHistory } = require("./plugins");
const softDelete = require("mongoose-delete");

module.exports = ({ Schema, Types, model }, mongoosePaginate) => {
  const Competition_Products = new Schema(
    {
      brandId: { type: String },
      productId: { type: String },
      websiteId: { type: String },
      productLink: { type: String },
      freeShipping: { type: String },
      price: { type: String },
      shippingPrice: { type: String },
      result: { type: String },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  Competition_Products.plugin(softDelete, {
    deletedBy: true,
    deletedAt: true,
    overrideMethods: "all",
  });
  Competition_Products.plugin(toJSON);
  Competition_Products.plugin(mongoosePaginate);

  /**
   * @typedef Competition_Products
   */
  return model("Competition_Products", Competition_Products);
};
