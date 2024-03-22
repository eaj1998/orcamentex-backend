var express = require("express");
const CustomerController = require("../controllers/CustomerController");

var router = express.Router();

router.get("/", CustomerController.customerList);
router.get("/getCustomers", CustomerController.customerListToOrder);
router.get("/:id", CustomerController.customerDetail);
router.post("/", CustomerController.customerCreate);
router.put("/:id", CustomerController.customerUpdate);
router.delete("/:id", CustomerController.customerDelete);

module.exports = router;