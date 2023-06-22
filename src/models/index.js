const mongoosePaginate = require("mongoose-paginate-v2");
const mongoose = require("mongoose-fill");

module.exports.User = require("./user.model")(mongoose, mongoosePaginate);
module.exports.Token = require("./token.model")(mongoose, mongoosePaginate);
module.exports.Mail = require("./mail.model")(mongoose, mongoosePaginate);
module.exports.Like = require("./like.model")(mongoose, mongoosePaginate);
module.exports.Contact = require("./contact.model")(mongoose, mongoosePaginate);
module.exports.Category = require("./category.model")(
  mongoose,
  mongoosePaginate
);
module.exports.Post = require("./post.model")(mongoose, mongoosePaginate);
module.exports.SubCategory = require("./subCategory.model")(
  mongoose,
  mongoosePaginate
);
module.exports.Media = require("./media.model")(mongoose, mongoosePaginate);
module.exports.Follow = require("./follow.model")(mongoose, mongoosePaginate);
module.exports.Location = require("./location.model")(
  mongoose,
  mongoosePaginate
);
module.exports.Review = require("./review.model")(mongoose, mongoosePaginate);
module.exports.TableColumns = require("./tableColumn.model")(
  mongoose,
  mongoosePaginate
);

module.exports.Pricing_Category = require("./pricingcategory.model")(
  mongoose,
  mongoosePaginate
);
module.exports.ShippingRules = require("./shipping.model")(
  mongoose,
  mongoosePaginate
);
module.exports.Products = require("./products.model")(
  mongoose,
  mongoosePaginate
);
module.exports.Competition = require("./competition.model")(
  mongoose,
  mongoosePaginate
);
module.exports.CompetitonProducts = require("./competitonproducts.model")(
  mongoose,
  mongoosePaginate
);
module.exports.Intergration = require("./integration.model")(
  mongoose,
  mongoosePaginate
);
