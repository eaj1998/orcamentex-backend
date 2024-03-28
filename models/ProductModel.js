var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
	name: {type: String, required: true},
    price: {type: Number, required: true},
    code: {type: String}
}, {timestamps: true});

module.exports = mongoose.model("Product", ProductSchema);