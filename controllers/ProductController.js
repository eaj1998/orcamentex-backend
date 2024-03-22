const Product = require("../models/ProductModel");
const Counter = require("../models/CounterModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Product Schema
function ProductData(data) {
	this.id = data._id;
	this.name= data.name;
	this.valor = data.valor;
	this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
}

/**
 * Product List.
 * 
 * @returns {Object}
 */
exports.productList = [
	auth,
	function (req, res) {
		try {
			Product.find().then((products)=>{
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
 * Product List To Order.
 * 
 * @returns {Object}
 */
exports.productListToOrder = [
	auth,
	function (req, res) {
		try {
			Product.find({
				$or: [
				  { name: { $regex: req.query.g, $options: "i" } },
				  { code: req.query.g },
				],
			  }).limit(15).then((customers)=>{
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
 * Product Detail.
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
			Product.findOne({_id: req.params.id}).then((product)=>{                
				if(product !== null){
					let productData = new ProductData(product);
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
 * Product store.
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

			Counter.findOneAndUpdate(
				{id: "counter"}, 
				{"$inc": {"seq":1}}, 
				{new: true}, (err, cd) => {
					if(cd === null) {
						const newCounter = new Counter({id: "counter", seq: 1});
						newCounter.save();
					}
				})

			getSeqValue(function(err, seq){
				var product = new Product(
					{ 
						name: req.body.name,
						valor: req.body.valor,
						code: seq
					});

				if (!errors.isEmpty()) {
					return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
				}
				else {
					//Save product.
					product.save(function (err) {
						if (err) { return apiResponse.ErrorResponse(res, err); }
						let productData = new ProductData(product);
						return apiResponse.successResponseWithData(res,"Product add Success.", productData);
					});
				}
			})
			
		} catch (err) {
			//throw error in json response with status 500. 
			console.log(err);
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

function getSeqValue(callback) {
	Counter.findOne({ id: "counter" }, function(err, counter) {
	  if (err) {
		// Handle error
		callback(err, null);
		return;
	  }
  
	  if (counter) {
		// Access the 'seq' field
		var seqValue = counter.seq;
		callback(null, seqValue);
	  } else {
		// Document not found
		callback("Document with id 'counter' not found", null);
	  }
	});
  }

/**
 * Product update.
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
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Product.findById(req.params.id, function (err, foundProduct) {
                        console.log('foundProduct', foundProduct);
						if(foundProduct === null){
							return apiResponse.notFoundResponse(res,"Product not exists with this id");
						}else{						
                            //update product.
                            Product.findByIdAndUpdate(req.params.id, req.body, {},function (err) {
                                if (err) { 
                                    return apiResponse.ErrorResponse(res, err); 
                                }else{
                                    let productData = new ProductData(req.body);
                                    return apiResponse.successResponseWithData(res,"Product update Success.", productData);
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
 * Product Delete.
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
			Product.findById(req.params.id, function (err, foundProduct) {
				if(foundProduct === null){
					return apiResponse.notFoundResponse(res,"Product not exists with this id");
				}else{
                    Product.findByIdAndRemove(req.params.id,function (err) {
                        if (err) { 
                            return apiResponse.ErrorResponse(res, err); 
                        }else{
                            return apiResponse.successResponse(res,"Product delete Success.");
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