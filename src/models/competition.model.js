const { toJSON, diffHistory } = require("./plugins");
const softDelete = require("mongoose-delete");

module.exports = ({ Schema, Types, model }, mongoosePaginate) => {
  const Competition = new Schema(
    {
      name: { type: String },
      website: { type: String },
      brandId: { type: String },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );
  Competition.plugin(softDelete, {
    deletedBy: true,
    deletedAt: true,
    overrideMethods: "all",
  });
  Competition.plugin(toJSON);
  Competition.plugin(mongoosePaginate);

  /**
   * @typedef Competition
   */
  return model("Competition", Competition);
};
