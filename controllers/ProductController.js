const { body, validationResult, check } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const ProductRepository = require("../repositories/ProductRepository");
const mongoose = require("mongoose");
const fs = require("fs");
const pdf = require("html-pdf");
const util = require("../helpers/utility");
const EntitiyNotFoundException = require("../exceptions/EntitiyNotFoundException");

// mongoose.set("useFindAndModify", false);

const productRepo = new ProductRepository();

exports.productList = [
    auth,
    async (req, res) => {
        try {
            const products = await productRepo.findAll();
            return apiResponse.successResponseWithData(res, "Operation success", products);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.productListSelect = [
    auth,
    async (req, res) => {
        try {
            const products = await productRepo.findByNameOrCode(req.query.g);
            return apiResponse.successResponseWithData(res, "Operation success", products.length > 0 ? products : []);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.productByCode = [
    auth,
    async (req, res) => {
        try {
            const product = await productRepo.findByCode(req.query.g);
            return apiResponse.successResponseWithData(res, "Operation success", product || []);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.productDetail = [
    auth,
    async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.successResponseWithData(res, "Operation success", {});
        }
        try {
            const product = await productRepo.findById(req.params.id);
            return apiResponse.successResponseWithData(res, "Operation success", product);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.productCreate = [
    auth,
    body("name", "Name must not be empty.").isLength({ min: 1 }).trim(),
    body("price", "Price must not be empty.").isLength({ min: 1 }).trim(),
    check("*").escape(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }
            const product = await productRepo.create(req.body);
            return apiResponse.successResponseWithData(res, "Operation success", product);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

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
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return apiResponse.validationErrorWithData(res, "Invalid ID", "Invalid ID");
            }
            const product = await productRepo.findById(req.params.id);
            if (!product) {
                return apiResponse.notFoundResponse(res, "Product not exists with this id");
            }
            const updatedProduct = await productRepo.update(product._id, req.body);
            return apiResponse.successResponseWithData(res, "Operation success", updatedProduct);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.productDelete = [
    auth,
    async (req, res) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return apiResponse.validationErrorWithData(res, "Invalid ID", "Invalid ID");
        }
        try {
            const product = await productRepo.findById(req.params.id);
            if (!product) {
                return apiResponse.notFoundResponse(res, "Product not exists with this id");
            }
            await productRepo.delete(product._id);
            return apiResponse.successResponse(res, "Product delete success.");
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

exports.downloadTabelaDePrecos = [
    auth,
    async (req, res) => {
        try {
            const products = await productRepo.findAll();
            const html = await updateHtmlTabelaPrecos("public/template_precos.html", products);
            const options = {
                format: "A4",
                orientation: "portrait",
                childProcessOptions: {
                    env: { OPENSSL_CONF: "/dev/null" }
                }
            };
            
            pdf.create(html, options).toBuffer((err, buffer) => {
                if (err) {
                    return res.status(500).json(err);
                }
                res.setHeader("Content-Type", "application/pdf");
                res.end(buffer);
            });
        } catch (err) {
            return apiResponse.ErrorResponse(res, new EntitiyNotFoundException(err));
        }
    }
];

async function updateHtmlTabelaPrecos(filePath, products) {
    const html = fs.readFileSync(filePath, "utf8");
    const productListHTML = products.map(product => `
        <tr>
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>${util.currencyFormatter(product.price)}</td>
        </tr>`).join("");
    return html.replace("{{ProductList}}", productListHTML);
}
