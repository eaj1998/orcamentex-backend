var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CustomerSchema = new Schema({
	name: {type: String, required: true},
	phone: {type: String, required: false},
	email: {type: String, required: false},
	cpfCnpj: {type: String, required: true},
	cep: { type: String },
	street: { type: String },
	district: {type: String},
	number: { type: String },
	city: { type: String },
	state: { type: String },
	inscricaoEstadual: { type: String }

}, {timestamps: true});

module.exports = mongoose.model("Customer", CustomerSchema);