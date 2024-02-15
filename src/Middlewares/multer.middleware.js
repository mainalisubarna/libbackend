"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/Uploads"); // Specify the destination folder for uploads
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9) + file.originalname;
        cb(null, uniqueSuffix);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg") {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid File type. Only images are allowed."));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        //60 mb max size
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter,
});
//# sourceMappingURL=multer.middleware.js.map