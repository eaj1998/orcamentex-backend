var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductOrderSchema = new Schema({
	productId: { type: Schema.Types.ObjectId, ref: 'Product'},
	quantity: { type: Number},
	price: { type: Number}
});

var OrderSchema = new Schema({
	title: {type: String, required: true},	
    customer: { type:  Schema.Types.ObjectId, ref: 'Customer' },
    products: [ProductOrderSchema]
}, {timestamps: true});

module.exports = mongoose.model("Order", OrderSchema);