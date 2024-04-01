const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const OrderRepository = require("../repositories/Orderrepository");
mongoose.set("useFindAndModify", false);
const fs = require('fs')
const pdf = require('html-pdf')
const path = require('path');
const util = require("../helpers/utility")

const orderRepo = new OrderRepository();

/**
 * Order List.
 * 
 * @returns {Object}
 */
exports.orderList = [
	auth,
	async function (req, res) {		
		try {
			const orders = await orderRepo.findAll();

			return apiResponse.successResponseWithData(res, "Operation success", orders);		
		} catch (err) {
			//throw error in json response with status 500. 
			console.log(err);
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
	async function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			// let total = 0;
			const order = await orderRepo.findById(req.params.id)
			// order.products.map((prod) => {
			// 	total +=  Number(prod.quantity * prod.price)
			// })
			return apiResponse.successResponseWithData(res, "Operation success", order);
		} catch (err) {
			console.log(err);
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
    body("customer", "É necessário associar o orçamento à um Cliente").isLength({ min: 1 }).trim(),
	body("products", "É necessário adicionar produtos ao orçamento.").custom((value) => { 
		if(value.length <= 0)
			return false

		return true
	}),
	sanitizeBody("**").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) 
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			
			const order = await orderRepo.create(req.body);
			apiResponse.successResponseWithData(res, "Operation success", order)
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
	sanitizeBody("**").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);	
			if (!errors.isEmpty()) 
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			

			if(!mongoose.Types.ObjectId.isValid(req.params.id)){
				return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
			}

			const order = await orderRepo.findById(req.params.id)
			if(!order)
				return apiResponse.validationErrorWithData(res, "Order doesnt exist", "Order doesnt exist");
			order.title = req.body.title;
			order.customer = req.body.customer;
			order.products = [];	
			req.body.products.map((prod) => {
				order.products.push({product: prod.product._id, quantity: prod.quantity, price: prod.price})
			})	
			
			const updatedOrder = await orderRepo.update(order._id, order)
			apiResponse.successResponseWithData(res, "Operation success", updatedOrder)
			
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
	async function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			const order = await orderRepo.findById(req.params.id)
			if(!order)
				return apiResponse.notFoundResponse(res,"Order not exists with this id");

			await orderRepo.delete(order._id)

			return apiResponse.successResponse(res,"Order delete Success.");
			
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}

];

exports.downloadOrder = [
	auth,
	async function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.body.id))
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");

		const order = await orderRepo.findById(req.body.id)
		if(!order)
			return apiResponse.notFoundResponse(res,"Order not exists with this id");

		const html = await updateHtml('public/template.html', order)

		const options = {
			type: 'pdf',
			format: 'A4',
			orientation: 'portrait'
		}
		

		pdf.create(html, options).toBuffer((err, buffer) => {
			if(err) return res.status(500).json(err)

			res.setHeader('Content-Type', 'application/pdf');
        	res.setHeader('Content-Disposition', 'attachment; filename=example.pdf')

			res.end(buffer)               
		})
	}
];


async function updateHtml(filePath, order) {
	
    const html = fs.readFileSync(filePath).toString()
	let updatedHtml = html.replace('{{CustomerName}}', order.customer.name)

	const productListHTML = await order.products.map(productOrder => `
	<tr>
		<td>${productOrder.product.code}</td>
		<td>${productOrder.product.name}</td>
		<td>${productOrder.quantity}</td>
		<td>${util.currencyFormatter(productOrder.price)}</td>
		<td>${util.currencyFormatter(productOrder.quantity * productOrder.price)}</td>
	</tr>`).join('');

	const totalPrice = await order.products.reduce((total, product) => total + (product.price * product.quantity), 0);
	// Add 7 days to the current date

	updatedHtml = updatedHtml.replace('{{ProductList}}', productListHTML);
	updatedHtml = updatedHtml.replace('{{Total}}', util.currencyFormatter(totalPrice));
	updatedHtml = updatedHtml.replace('{{DateExpiration}}', await getExpirationDate());

	return updatedHtml
}

async function getExpirationDate () {
	const currentDate = new Date();
	// Add 7 days to the current date
	currentDate.setDate(currentDate.getDate() + 7);

	// Extract day, month, and year components
	const day = currentDate.getDate();
	const month = currentDate.getMonth() + 1; // Month is zero-based
	const year = currentDate.getFullYear();

	// Pad single-digit day and month with leading zeros if necessary
	const formattedDay = day < 10 ? '0' + day : day;
	const formattedMonth = month < 10 ? '0' + month : month;

	// Format the date as "dd/mm/YYYY"
	const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;

	return formattedDate
}
