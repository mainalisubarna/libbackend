"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateUser = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const prisma = new client_1.PrismaClient();
const AuthenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (req.headers && ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith("Bearer "))) {
            const jwtToken = req.headers.authorization.split(" ")[1];
            const user = jsonwebtoken_1.default.verify(jwtToken, (_b = process.env.JWT_SECRET_KEY) !== null && _b !== void 0 ? _b : "");
            const { Email, Role } = user;
            let isUserValid;
            if (Role === "admin") {
                isUserValid = yield prisma.user.findUnique({
                    where: {
                        Email,
                    },
                });
            }
            else {
                isUserValid = yield prisma.students.findUnique({
                    where: {
                        Email,
                    },
                });
            }
            if (isUserValid) {
                req.user = isUserValid;
                next();
            }
            else {
                res.status(401).json({
                    status: false,
                    message: "Unauthorized User",
                });
            }
        }
        else {
            res.status(400).json({
                status: false,
                message: "Authorization Failed",
            });
        }
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
});
exports.AuthenticateUser = AuthenticateUser;
//# sourceMappingURL=Authorization.middleware.js.map