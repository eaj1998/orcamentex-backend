const Customer = require("../models/CustomerModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Customer Schema
function CustomerData(data) {
	this.id = data._id;
	this.name= data.name;
	this.phone = data.phone;
	this.email = data.email;
	this.createdAt = data.createdAt;
}

/**
 * Customer List.
 * 
 * @returns {Object}
 */
exports.customerList = [
	auth,
	function (req, res) {
		try {
			Customer.find().then((customers)=>{
				if(customers.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", customers);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Customer Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.customerDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Customer.findOne({_id: req.params.id}).then((customer)=>{                
				if(customer !== null){
					let customerData = new CustomerData(customer);
					return apiResponse.successResponseWithData(res, "Operation success", customerData);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Customer store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.customerCreate = [
	auth,
	body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var customer = new Customer(
				{ name: req.body.name,
					phone: req.body.phone,
					email: req.body.email
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save customer.
				customer.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let customerData = new CustomerData(customer);
					return apiResponse.successResponseWithData(res,"Customer add Success.", customerData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Customer update.
 * 
 * @param {string}      name 
 * @param {string}      email
 * @param {string}      phone
 * 
 * @returns {Object}
 */
exports.customerUpdate = [
	auth,
    body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var customer = new Customer(
				{ name: req.body.name,
					phone: req.body.phone,
					email: req.body.email
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Customer.findById(req.params.id, function (err, foundCustomer) {
                        console.log('foundCustomer', foundCustomer);
						if(foundCustomer === null){
							return apiResponse.notFoundResponse(res,"Customer not exists with this id");
						}else{						
                            //update customer.
                            Customer.findByIdAndUpdate(foundCustomer._id, customer, {},function (err) {
                                if (err) { 
                                    return apiResponse.ErrorResponse(res, err); 
                                }else{
                                    let customerData = new CustomerData(customer);
                                    return apiResponse.successResponseWithData(res,"Customer update Success.", customerData);
                                }
                            });							
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Customer Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.customerDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Customer.findById(req.params.id, function (err, foundCustomer) {
				if(foundCustomer === null){
					return apiResponse.notFoundResponse(res,"Customer not exists with this id");
				}else{
                    Customer.findByIdAndRemove(req.params.id,function (err) {
                        if (err) { 
                            return apiResponse.ErrorResponse(res, err); 
                        }else{
                            return apiResponse.successResponse(res,"Customer delete Success.");
                        }
                    });
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];