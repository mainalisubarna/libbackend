"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = __importDefault(require("./user.route"));
const student_route_1 = __importDefault(require("./student.route"));
const book_route_1 = __importDefault(require("./book.route"));
const bookTransaction_route_1 = __importDefault(require("./bookTransaction.route"));
const billing_route_1 = __importDefault(require("./billing.route"));
const Authorization_middleware_1 = require("../Middlewares/Authorization.middleware");
const router = (0, express_1.Router)();
router.use("/", user_route_1.default);
router.use("/students", student_route_1.default);
router.use("/books", Authorization_middleware_1.AuthenticateUser, book_route_1.default);
router.use("/books/transactions", Authorization_middleware_1.AuthenticateUser, bookTransaction_route_1.default);
router.use("/billings/fine", Authorization_middleware_1.AuthenticateUser, billing_route_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map