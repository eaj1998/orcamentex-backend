var express = require("express");
const ProductController = require("../controllers/ProductController");

var router = express.Router();

router.get("/order", ProductController.productListToOrder);
router.get("/", ProductController.productList);
router.get("/:id", ProductController.productDetail);
router.post("/", ProductController.productCreate);
router.put("/:id", ProductController.productUpdate);
router.delete("/:id", ProductController.productDelete);

module.exports = router;