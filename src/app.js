"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
require("dotenv/config");
const index_1 = __importDefault(require("./Routes/index"));
const app = (0, express_1.default)();
const cors = require("cors");
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8085;
app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});
app.use(cors());
app.use(express_1.default.json());
app.use((0, express_1.urlencoded)({ extended: true }));
app.use("/api/v1", index_1.default);
app.use((req, res, next) => {
    const error = new Error();
    error.status = 404;
    error.message = "Page Not Found";
    next(error);
});
//Error handler middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: false,
        message: error.message,
    });
});
//# sourceMappingURL=app.js.map