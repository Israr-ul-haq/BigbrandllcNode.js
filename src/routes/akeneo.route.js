const express = require("express");
const router = express.Router();
const {
  getToken,
  getProduct,
  addProduct,
  generateToken,
  getTableColumns,
  updateProduct,
  updateTableColumns,
  getBrand,
  addBrand,
  getVendor,
  addVendor,
  getAkneoBrands,
  getAkeneoPricingCategoriesByBrand,
  getProductCategories,
  updateProductData,
} = require("../controllers/akeneoController");
router.post("/token", getToken);
router.get("/products", generateToken, getProduct);
router.post("/products", generateToken, addProduct);
router.put("/products", generateToken, updateProduct);
router.get("/tables", getTableColumns);
router.post("/tables", updateTableColumns);
router.get("/brand", generateToken, getBrand);
router.post("/brand", generateToken, addBrand);
router.get("/product-category", generateToken, getVendor);
router.post("/product-category", generateToken, addVendor);
router.get("/AkeneoBrands", generateToken, getAkneoBrands);
router.get("/product_categories", generateToken, getProductCategories);
router.get(
  "/pricingCategories/:brandId",
  generateToken,
  getAkeneoPricingCategoriesByBrand
);
module.exports = router;
