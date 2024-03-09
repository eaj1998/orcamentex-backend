var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var customerRouter = require("./customer");
var productRouter = require("./product");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/customer/", customerRouter);
app.use("/product/", productRouter);

module.exports = app;