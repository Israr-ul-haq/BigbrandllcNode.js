const express = require("express");
const validate = require("@middlewares/validate");
const { productsController } = require("@controllers");
const auth = require("../middlewares/auth");

const router = express.Router();

router
  .route("/products_by_id/:sku")
  .get(auth({ anonymous: true }), productsController.getProductsById);
router
  .route("/productsAllProducts")
  .get(auth({ anonymous: true }), productsController.getAllProducts);
router
  .route("/getproductsbystatus")
  .get(auth({ anonymous: true }), productsController.getSelectedProducts);
router
  .route("/getZeroValueProducts")
  .get(auth({ anonymous: true }), productsController.getProductsByZeroValue);

router.put("/updateProduct/:id", productsController.updateProducts);
router.put("/updateProductStatus", productsController.updateProductsStatus);
router.put("/setAkeneoStatusFalse", productsController.setAkeneoStatusFalse);
router.put(
  "/update_the_products_websiteId/:id/:sourceId",
  productsController.updateProductWebsiteId
);
router.put(
  "/update_Competition_products/:id",
  productsController.updateCompetitionProducts
);
router.delete("/delete_Products", productsController.deleteProducts);

router.post(
  "/set_selected_products",
  productsController.selectedSearchedProducts
);

module.exports = router;
