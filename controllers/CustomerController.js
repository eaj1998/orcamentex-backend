const { body,validationResult } = require("express-validator");
const { check } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const CustomerRepository = require("../repositories/CustomerRepository");
mongoose.set("useFindAndModify", false);
const Correios = require('node-cep-correios');
const cpf = require('cpf-cnpj-validator'); 
const BaseException = require("../exceptions/BaseException");

const customerRepo = new CustomerRepository();
const buscaCep = new Correios();

/**
 * Customer List.
 * 
 * @returns {Object}
 */
exports.customerList = [
	auth,
	async function (req, res) {
		try {
			const customers = await customerRepo.findAll()
			return apiResponse.successResponseWithData(res, "Operation success", customers);		
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


/**
 * Customer List to Order.
 * 
 * @returns {Object}
 */
exports.customerListSelect = [
	auth,
	async function (req, res) {
		try {
			await customerRepo.findByCpfOrName(req.query.g).then((customers)=>{
				if(customers.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", customers);
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
 * Customer Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.customerDetail = [
	auth,
	async function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			const customer = await customerRepo.findById(req.params.id)
			return apiResponse.successResponseWithData(res, "Operation success", customer);
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
    body("cpfCnpj", "CPF/CNPJ Invalido.").custom((value) => { 
		if(value.length > 11)
			return cpf.cnpj.isValid(value)
		
		return cpf.cpf.isValid(value)
	}),
	check("*").escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);	
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}		
			let customer = await customerRepo.findByCpfCnpj(req.body.cpfCnpj);
			if(customer.length > 0)
				return apiResponse.ErrorResponse(res, new BaseException("Cliente já cadastrado."));

			customer = await customerRepo.create(req.body);
			apiResponse.successResponseWithData(res, "Operation success", customer)
				
		} catch (err) {
			//throw error in json response with status 500. 
			console.log(err);
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
			const customer = await customerRepo.findById(req.params.id)
			const updatedCustomer = await customerRepo.update(customer._id, req.body)
			apiResponse.successResponseWithData(res, "Operation success", updatedCustomer)
		
	
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
	async function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			const customer = await customerRepo.findById(req.params.id)
			if(!customer)
				return apiResponse.notFoundResponse(res,"Customer not exists with this id");

			await customer.delete(customer._id)

			return apiResponse.successResponse(res,"Customer delete Success.");
			
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];


/**
 * Find Customer Address
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.customerCep = [
	auth,
	async function (req, res) {		
		await buscaCep.consultaCEP({cep: req.params.cep}).then( result => {
			return apiResponse.successResponseWithData(res, "Operation success", result)
		}).catch(err => {
			return apiResponse.ErrorResponse(res, err);
		})
	}
];