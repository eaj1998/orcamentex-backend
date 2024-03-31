var express = require("express");
const CustomerController = require("../controllers/CustomerController");

var router = express.Router();

router.get("/", CustomerController.customerList);
router.get("/buscaCep/:cep", CustomerController.customerCep);
router.get("/getCustomers", CustomerController.customerListSelect);
router.get("/:id", CustomerController.customerDetail);
router.post("/", CustomerController.customerCreate);
router.put("/:id", CustomerController.customerUpdate);
router.delete("/:id", CustomerController.customerDelete);

module.exports = router;