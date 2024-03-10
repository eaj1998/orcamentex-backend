var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var OrderSchema = new Schema({
	title: {type: String, required: true},
}, {timestamps: true});

module.exports = mongoose.model("Order", OrderSchema);