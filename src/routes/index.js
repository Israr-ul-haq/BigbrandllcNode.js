const express = require("express"),
  config = require("../config/config");

const router = express.Router();
const defaultRoutes = [
  {
    path: "/auth",
    route: require("./auth.route"),
  },
  {
    path: "/categories",
    route: require("./category.route"),
  },
  {
    path: "/contact",
    route: require("./contact.route"),
  },
  {
    path: "/follow",
    route: require("./follow.route"),
  },
  {
    path: "/locations",
    route: require("./location.route"),
  },
  {
    path: "/akeneo",
    route: require("./akeneo.route"),
  },
  {
    path: "/price",
    route: require("./pricing.route"),
  },
  {
    path: "/product",
    route: require("./products.route"),
  },
  {
    path: "/rules",
    route: require("./shipping.route"),
  },
  {
    path: "/competitor",
    route: require("./competition.route"),
  },
  {
    path: "/competitor_products",
    route: require("./competitionProducts.route"),
  },
  {
    path: "/integration",
    route: require("./integration.route"),
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

const devRoutes = [
  {
    path: "/docs",
    route: require("./docs.route"),
  },
];

if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
