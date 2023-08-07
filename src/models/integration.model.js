const { toJSON, diffHistory } = require("./plugins");
const softDelete = require("mongoose-delete");

module.exports = ({ Schema, Types, model }, mongoosePaginate) => {
  const Integration = new Schema(
    {
      userName: { type: String },
      password: { type: String },
      secret: { type: String },
      clientId: { type: String },
      domain: { type: String },
      status: { type: Boolean },
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );
  Integration.plugin(softDelete, {
    deletedBy: true,
    deletedAt: true,
    overrideMethods: "all",
  });
  Integration.plugin(toJSON);
  Integration.plugin(mongoosePaginate);

  /**
   * @typedef Integration
   */
  return model("Integration", Integration);
};
