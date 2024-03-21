var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductSchema = new Schema({
	name: {type: String, required: true},
    valor: {type: Number, required: true},
    code: {type: Number}
}, {timestamps: true});

module.exports = mongoose.model("Product", ProductSchema);