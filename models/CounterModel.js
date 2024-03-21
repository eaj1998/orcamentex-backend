var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CounterSchema = new Schema({
    id: {type: String},
    seq: {type: Number}
}, {timestamps: true});

module.exports = mongoose.model("Counter", CounterSchema);