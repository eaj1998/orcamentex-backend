var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var customerRouter = require("./customer");
var productRouter = require("./product");
var orderRouter = require("./order");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/customer/", customerRouter);
app.use("/product/", productRouter);
app.use("/order/", orderRouter);

module.exports = app;