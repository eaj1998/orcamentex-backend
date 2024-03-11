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
	this.customer = data.customer;
	this.products = data.products;
	this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
}

/**
 * Order List.
 * 
 * @returns {Object}
 */
exports.orderList = [
	auth,
	function (req, res) {
		try {
			Order.find().populate('customer').then((orders)=>{
				if(orders.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", orders);
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
exports.orderDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Order.findOne({_id: req.params.id}).then((order)=>{                
				if(order !== null){
					let orderData = new OrderData(order);
					return apiResponse.successResponseWithData(res, "Operation success", orderData);
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
exports.orderCreate = [
	auth,
	(req, res) => {
		try {
			const errors = validationResult(req);
			var order = new Order(req.body);

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save order.
				order.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					return apiResponse.successResponseWithData(res,"Order add Success.", req.body);
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
 * @param {string}      title 
 * @param {string}      email
 * @param {string}      phone
 * 
 * @returns {Object}
 */
exports.orderUpdate = [
	auth,
    body("title", "Name must not be empty.").isLength({ min: 1 }).trim(),
	(req, res) => {
		try {
			const errors = validationResult(req);	
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Order.findById(req.params.id, function (err, foundOrder) {
						if(foundOrder === null){
							return apiResponse.notFoundResponse(res,"Order not exists with this id");
						}else{						
                            //update order.
                            Order.findByIdAndUpdate(req.params.id, req.body, {},function (err) {
                                if (err) { 
                                    return apiResponse.ErrorResponse(res, err); 
                                }else{
                                    let orderData = new OrderData(req.body);
                                    return apiResponse.successResponseWithData(res,"Order update Success.", orderData);
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
exports.orderDelete = [
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