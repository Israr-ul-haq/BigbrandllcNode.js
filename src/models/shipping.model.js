const { toJSON, diffHistory } = require("./plugins");
const softDelete = require("mongoose-delete");

module.exports = ({ Schema, Types, model }, mongoosePaginate) => {
  const ShippingRules = new Schema(
    {
      freightClass: { type: String },
      weightFrom: { type: String },
      weightTo: { type: String },
      shippingCost: { type: String },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );
  ShippingRules.plugin(softDelete, {
    deletedBy: true,
    deletedAt: true,
    overrideMethods: "all",
  });
  ShippingRules.plugin(toJSON);
  ShippingRules.plugin(mongoosePaginate);

  /**
   * @typedef ShippingRules
   */
  return model("ShippingRules", ShippingRules);
};
