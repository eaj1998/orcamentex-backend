var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CustomerSchema = new Schema({
	name: {type: String, required: true},
	phone: {type: String, required: false},
	email: {type: String, required: false},
}, {timestamps: true});

module.exports = mongoose.model("Customer", CustomerSchema);