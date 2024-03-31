var express = require("express");
var authRouter = require("./auth");
var customerRouter = require("./customer");
var productRouter = require("./product");
var orderRouter = require("./order");

var app = express();

app.use("/auth/", authRouter);
app.use("/customer/", customerRouter);
app.use("/product/", productRouter);
app.use("/order/", orderRouter);

module.exports = app;