"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = __importDefault(require("cloudinary"));
require("dotenv/config");
cloudinary_1.default.v2.config({
    cloud_name: "dhckbghuk",
    api_key: "136928961167224",
    api_secret: "8p3CaLSzCDDPXHiPTRIY_krOT_M",
});
exports.default = cloudinary_1.default;
//# sourceMappingURL=cloudinary.config.js.map