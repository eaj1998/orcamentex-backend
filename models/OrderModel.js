var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductOrderSchema = new Schema({
	product: { type: Schema.Types.ObjectId, ref: 'Product'},
	quantity: { type: Number},
	price: { type: Number}
});

var OrderSchema = new Schema({
	title: { type: String, required: true },	
    customer: { type:  Schema.Types.ObjectId, ref: 'Customer' },
    products: [ProductOrderSchema]
}, {timestamps: true});

const order = mongoose.model("Order", OrderSchema);
const productOrder = mongoose.model("ProductOrder", ProductOrderSchema);

module.exports = { Order: order, ProductOrder: productOrder }