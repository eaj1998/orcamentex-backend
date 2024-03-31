var express = require("express");
const OrderController = require("../controllers/OrderController");

var router = express.Router();

router.get("/", OrderController.orderList);
router.get("/:id", OrderController.orderDetail);
router.post("/download", OrderController.downloadOrder);
router.post("/", OrderController.orderCreate);
router.put("/:id", OrderController.orderUpdate);
router.delete("/:id", OrderController.orderDelete);

module.exports = router;