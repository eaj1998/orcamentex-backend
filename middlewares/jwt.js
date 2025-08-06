const { expressjwt } = require("express-jwt");
const secret = process.env.JWT_SECRET;

const authenticate = expressjwt({
	secret: secret,
	algorithms: ["HS256"]
});

module.exports = authenticate;