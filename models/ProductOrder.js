var mongoose = require("mongoose");
const ProductModel = require("./ProductModel");

var Schema = mongoose.Schema;

var OrderSchema = new Schema({
	title: {type: String, required: true},
    products: [{name: {type: string}, valor: {type: number}}]
}, {timestamps: true});

module.exports = mongoose.model("ProductOrder", ProductOrderSchema);