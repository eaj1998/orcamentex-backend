const UserModel = require("../models/UserModel");
const { body, validationResult } = require("express-validator");
const { check } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const fs = require('fs');

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.register = [
    body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
        .isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
    body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
        .isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
    body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
        .isEmail().withMessage("Email must be a valid email address.").custom(async (value) => {
            const user = await UserModel.findOne({ email: value });
            if (user) {
                throw new Error("E-mail already in use");
            }
        }),
    body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
    check("firstName").escape(),
    check("lastName").escape(),
    check("email").escape(),
    check("password").escape(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }

            const hash = await bcrypt.hash(req.body.password, 10);
            const otp = utility.randomNumber(4);
            const user = new UserModel({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hash,
                confirmOTP: otp
            });

            let html = fs.readFileSync('public/confirmation.html').toString();
            html = html.replace('{{otp}}', otp);

            await mailer.send(constants.confirmEmails.from, req.body.email, "Confirm Account", html);
            await user.save();

            const userData = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                otp: otp
            };

            return apiResponse.successResponseWithData(res, "Registration Success.", userData);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
    body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
        .isEmail().withMessage("Email must be a valid email address."),
    body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
    check("email").escape(),
    check("password").escape(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }

            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
            }

            const same = await bcrypt.compare(req.body.password, user.password);
            if (!same) {
                return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
            }

            if (!user.isConfirmed) {
                return apiResponse.unauthorizedResponse(res, "Account is not confirmed. Please confirm your account.");
            }

            if (!user.status) {
                return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
            }

            const userData = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            };

            const jwtPayload = userData;
            const jwtData = {
                expiresIn: process.env.JWT_TIMEOUT_DURATION,
            };
            const secret = process.env.JWT_SECRET;
            userData.token = jwt.sign(jwtPayload, secret, jwtData);

            return apiResponse.successResponseWithData(res, "Login Success.", userData);
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
    body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
        .isEmail().withMessage("Email must be a valid email address."),
    body("otp").isLength({ min: 1 }).trim().withMessage("OTP must be specified."),
    check("email").escape(),
    check("otp").escape(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }

            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                return apiResponse.unauthorizedResponse(res, "Specified email not found.");
            }

            if (user.isConfirmed) {
                return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
            }

            if (user.confirmOTP !== req.body.otp) {
                return apiResponse.unauthorizedResponse(res, "Otp does not match");
            }

            await UserModel.findOneAndUpdate({ email: req.body.email }, {
                isConfirmed: 1,
                confirmOTP: null
            });

            return apiResponse.successResponse(res, "Account confirmed success.");
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
    body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
        .isEmail().withMessage("Email must be a valid email address."),
    check("email").escape(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }

            const user = await UserModel.findOne({ email: req.body.email });
            if (!user) {
                return apiResponse.unauthorizedResponse(res, "Specified email not found.");
            }

            if (user.isConfirmed) {
                return apiResponse.unauthorizedResponse(res, "Account already confirmed.");
            }

            const otp = utility.randomNumber(4);
            let html = fs.readFileSync('public/confirmation.html').toString();
            html = html.replace('{{otp}}', otp);

            await mailer.send(constants.confirmEmails.from, req.body.email, "Confirm Account", html);
            user.confirmOTP = otp;
            await user.save();

            return apiResponse.successResponse(res, "Confirm otp sent.");
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];