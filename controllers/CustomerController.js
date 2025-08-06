const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const mongoose = require("mongoose");
const CustomerRepository = require("../repositories/CustomerRepository");
const Correios = require("node-cep-correios")
const cpf = require("cpf-cnpj-validator")
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
    async (req, res) => {
        try {
            const customers = await customerRepo.findAll();
            return apiResponse.successResponseWithData(res, "Operation success", customers);
        } catch (err) {
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
    async (req, res) => {
        try {
            const customers = await customerRepo.findByCpfOrName(req.query.g);
            const responseData = customers.length > 0 ? customers : [];
            return apiResponse.successResponseWithData(res, "Operation success", responseData);
        } catch (err) {
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
    async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.successResponseWithData(res, "Operation success", {});
        }
        try {
            const customer = await customerRepo.findById(req.params.id);
            return apiResponse.successResponseWithData(res, "Operation success", customer);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

/**
 * Customer store.
 * 
 * @param {string}      name 
 * @param {string}      cpfCnpj
 * 
 * @returns {Object}
 */
exports.customerCreate = [
    auth,
    body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
    body("cpfCnpj", "CPF/CNPJ Invalido.").custom((value) => {
        if (value === '') return true;
        return value.length > 11 ? cpf.cnpj.isValid(value) : cpf.cpf.isValid(value);
    }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }

            const existingCustomer = await customerRepo.findByCpfCnpj(req.body.cpfCnpj);
            if (existingCustomer.length > 0) {
                return apiResponse.ErrorResponse(res, new BaseException("Cliente já cadastrado."));
            }

            const customer = await customerRepo.create(req.body);
            return apiResponse.successResponseWithData(res, "Operation success", customer);
        } catch (err) {
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
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }

            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
            }

            const customer = await customerRepo.findById(req.params.id);
            const updatedCustomer = await customerRepo.update(customer._id, req.body);
            return apiResponse.successResponseWithData(res, "Operation success", updatedCustomer);
        } catch (err) {
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
    async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
        }
        try {
            const customer = await customerRepo.findById(req.params.id);
            if (!customer) {
                return apiResponse.notFoundResponse(res, "Customer not exists with this id");
            }

            await customerRepo.delete(customer._id);
            return apiResponse.successResponse(res, "Customer delete Success.");
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

/**
 * Find Customer Address
 * 
 * @param {string}      cep
 * 
 * @returns {Object}
 */
exports.customerCep = [
    auth,
    async (req, res) => {
        try {
            const result = await buscaCep.consultaCEP({ cep: req.params.cep });
            return apiResponse.successResponseWithData(res, "Operation success", result);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];