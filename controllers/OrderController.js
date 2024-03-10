const Order = require("../models/OrderModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Order Schema
function OrderData(data) {
	this.id = data._id;
	this.title= data.title;
	this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
}

/**
 * Order List.
 * 
 * @returns {Object}
 */
exports.productList = [
	auth,
	function (req, res) {
		try {
			Order.find().then((products)=>{
				if(products.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", products);
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
 * Order Detail.
 * 
 * @param {string} id
 * 
 * @returns {Object}
 */
exports.productDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Order.findOne({_id: req.params.id}).then((product)=>{                
				if(product !== null){
					let productData = new OrderData(product);
					return apiResponse.successResponseWithData(res, "Operation success", productData);
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
 * Order store.
 * 
 * @param {string}      name 
 * @param {number}      valor
 * 
 * @returns {Object}
 */
exports.productCreate = [
	auth,
	body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
	body("valor", "Valor must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var product = new Order(
				{ name: req.body.name,
					valor: req.body.valor,
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save product.
				product.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let productData = new OrderData(product);
					return apiResponse.successResponseWithData(res,"Order add Success.", productData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Order update.
 * 
 * @param {string}      name 
 * @param {string}      email
 * @param {string}      phone
 * 
 * @returns {Object}
 */
exports.productUpdate = [
	auth,
    body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var product = new Order(
				{ name: req.body.name,
					valor: req.body.valor,
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Order.findById(req.params.id, function (err, foundOrder) {
                        console.log('foundOrder', foundOrder);
						if(foundOrder === null){
							return apiResponse.notFoundResponse(res,"Order not exists with this id");
						}else{						
                            //update product.
                            Order.findByIdAndUpdate(req.params.id, product, {},function (err) {
                                if (err) { 
                                    return apiResponse.ErrorResponse(res, err); 
                                }else{
                                    let productData = new OrderData(product);
                                    return apiResponse.successResponseWithData(res,"Order update Success.", productData);
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
 * Order Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.productDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Order.findById(req.params.id, function (err, foundOrder) {
				if(foundOrder === null){
					return apiResponse.notFoundResponse(res,"Order not exists with this id");
				}else{
                    Order.findByIdAndRemove(req.params.id,function (err) {
                        if (err) { 
                            return apiResponse.ErrorResponse(res, err); 
                        }else{
                            return apiResponse.successResponse(res,"Order delete Success.");
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