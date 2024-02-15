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
exports.userProfilePicUpdate = exports.userPassAvatarChange = exports.getMyInfo = exports.processLogin = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const cloudinary_config_1 = __importDefault(require("../../config/cloudinary.config"));
const fs = require("fs");
const deleteResources = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs.unlink(filePath, (err) => {
        if (err) {
            console.log(err);
        }
    });
});
const processLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const hashed = yield bcrypt_1.default.hash("Aroma@@", 12);
        console.log(hashed);
        const isUserValid = yield prisma.user.findUnique({
            where: {
                Email: email,
            },
        });
        if (isUserValid) {
            const isPasswordValid = yield bcrypt_1.default.compare(password, isUserValid.Password);
            if (isPasswordValid) {
                const secretKey = process.env.JWT_SECRET_KEY;
                const jwtToken = jsonwebtoken_1.default.sign(Object.assign(Object.assign({}, isUserValid), { Role: "admin" }), secretKey, {
                    expiresIn: "24h",
                });
                res.status(200).json({
                    status: true,
                    jwtToken,
                    data: isUserValid,
                    message: "User Logged In Successfully",
                });
            }
            else {
                res.status(401).json({
                    status: false,
                    message: "Wrong Credentials",
                });
            }
        }
        else {
            res.status(401).json({
                status: false,
                message: "Wrong Credentials",
            });
        }
    }
    catch (error) {
        res.status(401).json({
            status: false,
            message: error.message,
        });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.processLogin = processLogin;
const getMyInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const jwtToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        const secretKey = process.env.JWT_SECRET_KEY;
        const userDetails = jsonwebtoken_1.default.verify(jwtToken, (_b = process.env.JWT_SECRET_KEY) !== null && _b !== void 0 ? _b : "");
        res.status(200).json({
            status: true,
            data: userDetails,
            message: "User Data Fetched Successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.getMyInfo = getMyInfo;
const userPassAvatarChange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const { newPassword, currentPassword, id, isPhotoChanged } = req.body;
        const uploadedPhoto = (_c = req.file) === null || _c === void 0 ? void 0 : _c.path;
        const user = yield prisma.user.findUnique({
            where: {
                User_Id: Number(id),
            },
        });
        const isCurrentPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.Password);
        if (isCurrentPasswordValid) {
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, Number(process.env.BCRYPT_SALT_ROUND));
            if (isPhotoChanged) {
                if (user.photo_public_id !== null) {
                    yield cloudinary_config_1.default.v2.uploader.destroy(user.photo_public_id);
                }
                const newPhoto = yield cloudinary_config_1.default.v2.uploader.upload(uploadedPhoto, {
                    gravity: "face",
                    width: 300,
                    height: 300,
                    crop: "thumb", // You can use 'thumb' for face-based cropping
                });
                deleteResources(uploadedPhoto);
                const updatedUser = yield prisma.user.update({
                    where: {
                        User_Id: Number(id),
                    },
                    data: {
                        Password: hashedPassword,
                        photo: newPhoto.secure_url,
                        photo_public_id: newPhoto.public_id,
                    },
                });
                res.status(200).json({
                    status: true,
                    data: updatedUser,
                    message: "User Details Updated Successfully",
                });
            }
            else {
                const updatedUser = yield prisma.user.update({
                    where: {
                        User_Id: Number(id),
                    },
                    data: {
                        Password: hashedPassword,
                    },
                });
                res.status(200).json({
                    status: true,
                    data: updatedUser,
                    message: "User Details Updated Successfully",
                });
            }
        }
        else {
            res.status(401).json({
                status: false,
                message: "Current Password doesn't match",
            });
        }
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.userPassAvatarChange = userPassAvatarChange;
const userProfilePicUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const { id } = req.body;
        const uploadedPhoto = (_d = req.file) === null || _d === void 0 ? void 0 : _d.path;
        const user = yield prisma.user.findUnique({
            where: {
                User_Id: Number(id),
            },
        });
        if (user.photo_public_id !== null) {
            yield cloudinary_config_1.default.v2.uploader.destroy(user.photo_public_id);
        }
        const newPhoto = yield cloudinary_config_1.default.v2.uploader.upload(uploadedPhoto, {
            gravity: "face",
            width: 300,
            height: 300,
            crop: "thumb", // You can use 'thumb' for face-based cropping
        });
        deleteResources(uploadedPhoto);
        const updatedUser = yield prisma.user.update({
            where: {
                User_Id: Number(id),
            },
            data: {
                photo: newPhoto.secure_url,
                photo_public_id: newPhoto.public_id,
            },
        });
        res.status(200).json({
            status: true,
            data: updatedUser,
            message: "User Details Updated Successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.userProfilePicUpdate = userProfilePicUpdate;
//# sourceMappingURL=user.controller.js.map