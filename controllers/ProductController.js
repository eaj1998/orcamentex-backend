const { body,validationResult } = require("express-validator");
const { check } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const ProductRepository = require("../repositories/ProductRepository");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const fs = require('fs')
const pdf = require('html-pdf')
const util = require("../helpers/utility")
const EntitiyNotFoundException = require("../exceptions/EntitiyNotFoundException");
const productRepo = new ProductRepository();

/**
 * Product List.
 * 
 * @returns {Object}
 */
exports.productList = [
	auth,
	async function (req, res) {
		try {
			const products = await productRepo.findAll()
			return apiResponse.successResponseWithData(res, "Operation success", products);		
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
exports.productListSelect = [
	auth,
	async function (req, res) {
		try {
			await productRepo.findByNameOrCode(req.query.g).then((products)=>{
				if(products.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", products);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			})
			
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


/**
 * Product by code
 * 
 * @returns {Object}
 */
exports.productByCode = [
	auth,
	async function (req, res) {
		try {
			const product =  await productRepo.findByCode(req.query.g); 
			if(product != null)				
				return apiResponse.successResponseWithData(res, "Operation success", product);

			return apiResponse.successResponseWithData(res, "Operation success", []);
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
	async function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			const product = await productRepo.findById(req.params.id)
			return apiResponse.successResponseWithData(res, "Operation success", product);
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
 * @param {number}      price
 * 
 * @returns {Object}
 */
exports.productCreate = [
    auth,
    body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
    body("price", "Valor must not be empty.").isLength({ min: 1 }).trim(),
    check("*").escape(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) 
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());

			const product = await productRepo.create(req.body);
			apiResponse.successResponseWithData(res, "Operation success", product)

        } catch (err) {
            // Throw error in JSON response with status 500. 
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

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
	check("*").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);	
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
			}
			const product = await productRepo.findById(req.params.id)
			const updatedProduct = await productRepo.update(product._id, req.body)
			apiResponse.successResponseWithData(res, "Operation success", updatedProduct)
		
	
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
	async function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			const product = await productRepo.findById(req.params.id)
			if(!product)
				return apiResponse.notFoundResponse(res,"Product not exists with this id");

			await productRepo.delete(product._id)

			return apiResponse.successResponse(res,"Product delete Success.");
			
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

exports.downloadTabelaDePrecos = [
	auth,
	async function (req, res) {
			try {
				const products = await productRepo.findAll()
				const html = await updateHtmlTabelaPrecos('public/template_precos.html', products)
				const options = {
					type: 'pdf',
					format: 'A4',
					orientation: 'portrait',
					childProcessOptions: {
						env: {
							OPENSSL_CONF: '/dev/null',
							}
					}
				}
				
				pdf.create(html, options).toBuffer((err, buffer) => {
					if(err){
						return res.status(500).json(err)
					} 

					res.setHeader('Content-Type', 'application/pdf');
					// res.setHeader('Content-Disposition', 'attachment; filename=example.pdf')

					res.end(buffer)               
				})
			} catch(err) {
				return apiResponse.ErrorResponse(res, new EntitiyNotFoundException(err));
			}
	}
];

async function updateHtmlTabelaPrecos(filePath, products) {
	
    const html = fs.readFileSync(filePath).toString()
	let updatedHtml = html;

	const productListHTML = await products.map(product => `
	<tr>
		<td>${product.code}</td>
		<td>${product.name}</td>
		<td>${util.currencyFormatter(product.price)}</td>
	</tr>`).join('');

	updatedHtml = updatedHtml.replace('{{ProductList}}', productListHTML);

	return updatedHtml
}
