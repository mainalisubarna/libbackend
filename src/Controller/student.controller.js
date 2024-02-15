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
exports.newPasswordReq = exports.sendOTPPRESET = exports.userProfilePicUpdate = exports.StudentPassAvatarChange = exports.processLogin = exports.newPassword = exports.verifyOTP = exports.verifyStudent = exports.deleteStudent = exports.editStudent = exports.registerStudent = exports.getAllStudents = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SendMail_1 = require("../Service/SendMail");
const cloudinary_config_1 = __importDefault(require("../../config/cloudinary.config"));
const prisma = new client_1.PrismaClient();
const fs = require("fs");
const deleteResources = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs.unlink(filePath, (err) => {
        if (err) {
            console.log(err);
        }
    });
});
const getAllStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield prisma.students.findMany({
            orderBy: {
                Student_Id: "desc",
            },
        });
        if (students.length > 0) {
            res.status(200).json({
                status: true,
                data: students,
                message: "Data Fetched Successfully",
            });
        }
        else {
            res.status(400).json({
                status: false,
                message: "Unable to find students",
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
exports.getAllStudents = getAllStudents;
const registerStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Academics, Email, First_Name, Last_Name } = req.body;
        const students = yield prisma.students.create({
            data: {
                First_Name: First_Name.trim(),
                Last_Name: Last_Name.trim(),
                Email,
                Academics,
            },
        });
        res.status(200).json({
            status: true,
            data: students,
            message: "Student Registered Successfully",
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
exports.registerStudent = registerStudent;
const editStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { Academics, Email, First_Name, Last_Name } = req.body;
        const student = yield prisma.students.update({
            where: {
                Student_Id: Number(id),
            },
            data: {
                First_Name,
                Last_Name,
                Email,
                Academics,
            },
        });
        res.status(200).json({
            status: true,
            data: student,
            message: "Student Details Updated Successfully",
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
exports.editStudent = editStudent;
const deleteStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.fineTransaction.deleteMany({
            where: {
                BookTransaction: {
                    Student: {
                        Student_Id: Number(id),
                    },
                },
            },
        });
        yield prisma.bookTransaction.deleteMany({
            where: {
                Student: {
                    Student_Id: Number(id),
                },
            },
        });
        const student = yield prisma.students.findUnique({
            where: {
                Student_Id: Number(id),
            },
        });
        const { photo_public_id } = student;
        yield cloudinary_config_1.default.v2.uploader.destroy(photo_public_id);
        yield prisma.students.delete({
            where: {
                Student_Id: Number(id),
            },
        });
        res.status(200).json({
            status: true,
            message: "Student Details has been deleted Successfully",
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
exports.deleteStudent = deleteStudent;
const verifyStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const isStudentFound = yield prisma.students.findUnique({
            where: {
                Email: email,
            },
        });
        if (isStudentFound && isStudentFound.isEmailVerified === 0) {
            const otpToken = `${Math.floor(1000 + Math.random() * 9000)}`;
            const updateStudentWithOtp = yield prisma.students.update({
                where: {
                    Student_Id: Number(isStudentFound.Student_Id),
                },
                data: {
                    OTP: Number(otpToken),
                    OTP_EXPIRY: (Date.now() + 10 * 60 * 1000).toString(),
                },
            });
            if (updateStudentWithOtp) {
                try {
                    yield (0, SendMail_1.sendEmail)({
                        email,
                        subject: "Verify your Account - " + updateStudentWithOtp.First_Name,
                        message: `<html>
            <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #f2f2f2; padding: 20px; color: #333; margin: 0;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="padding: 20px;">
                    <h1 style="text-align: center; color: #007bff; margin-bottom: 20px;">Activate Your Account</h1>
                    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.8;">
                      Dear ${updateStudentWithOtp.First_Name},<br>
                      You are receiving this email because you have requested to activate your account.<br>
                      Your OTP token is: <strong><span style="color: #007bff;">${updateStudentWithOtp.OTP}</span></strong><br>
                      Your token will expire in 10 minutes.<br><br>
                      Best Regards,<br>
                      Aroma School
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
                    <p style="font-style: italic; color: #555;">- Aroma School</p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `,
                    });
                    res.status(200).json({
                        status: true,
                        data: updateStudentWithOtp,
                        message: "OTP has been sent successfully",
                    });
                }
                catch (error) {
                    res.status(500).json({
                        status: false,
                        message: error.message,
                    });
                }
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "System can't generate OTP",
                });
            }
        }
        else {
            res.status(404).json({
                status: false,
                message: "Student Not Found Or Already Activated",
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
exports.verifyStudent = verifyStudent;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otpToken, email, id } = req.body;
        const isOTPValid = yield prisma.students.findUnique({
            where: {
                Student_Id: Number(id),
                AND: {
                    Email: email,
                    OTP: Number(otpToken),
                    OTP_EXPIRY: {
                        gte: Date.now().toString(),
                    },
                },
            },
        });
        if (isOTPValid) {
            const changeOtpAEXP = yield prisma.students.update({
                where: {
                    Student_Id: Number(id),
                },
                data: {
                    OTP: null,
                    OTP_EXPIRY: null,
                },
            });
            if (changeOtpAEXP) {
                res.status(200).json({
                    status: true,
                    message: "Otp Verified Successfully",
                });
            }
        }
        else {
            res.status(401).json({
                status: false,
                message: "Incorrect OTP or OTP expired",
            });
        }
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: "Otp verification failed",
        });
    }
    finally {
        yield prisma.$disconnect();
    }
});
exports.verifyOTP = verifyOTP;
const newPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, password } = req.body;
        const hashedPassword = yield bcrypt_1.default.hash(password, Number(process.env.BCRYPT_SALT_ROUND));
        const updatedUser = yield prisma.students.update({
            where: {
                Student_Id: Number(id),
            },
            data: {
                Password: hashedPassword,
                isEmailVerified: 1,
            },
        });
        if (updatedUser) {
            res.status(200).json({
                status: true,
                message: "User Verified Successfully",
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
exports.newPassword = newPassword;
const processLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const isStudentValid = yield prisma.students.findUnique({
            where: {
                Email: email,
            },
        });
        if (isStudentValid.Password !== null) {
            const isPasswordValid = yield bcrypt_1.default.compare(password, isStudentValid.Password);
            if (isPasswordValid) {
                const secretKey = process.env.JWT_SECRET_KEY;
                const jwtToken = jsonwebtoken_1.default.sign(Object.assign(Object.assign({}, isStudentValid), { Role: "student" }), secretKey, {
                    expiresIn: "24h",
                });
                res.status(200).json({
                    status: true,
                    jwtToken,
                    data: isStudentValid,
                    message: "Student Logged In Successfully",
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
const StudentPassAvatarChange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { newPassword, currentPassword, id, isPhotoChanged } = req.body;
        const uploadedPhoto = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        const user = yield prisma.students.findUnique({
            where: {
                Student_Id: Number(id),
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
                const updatedUser = yield prisma.students.update({
                    where: {
                        Student_Id: Number(id),
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
                    message: "Students Details Updated Successfully",
                });
            }
            else {
                const updatedUser = yield prisma.students.update({
                    where: {
                        Student_Id: Number(id),
                    },
                    data: {
                        Password: hashedPassword,
                    },
                });
                res.status(200).json({
                    status: true,
                    data: updatedUser,
                    message: "Student Details Updated Successfully",
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
exports.StudentPassAvatarChange = StudentPassAvatarChange;
const userProfilePicUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { id } = req.body;
        const uploadedPhoto = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path;
        const user = yield prisma.students.findUnique({
            where: {
                Student_Id: Number(id),
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
        const updatedUser = yield prisma.students.update({
            where: {
                Student_Id: Number(id),
            },
            data: {
                photo: newPhoto.secure_url,
                photo_public_id: newPhoto.public_id,
            },
        });
        res.status(200).json({
            status: true,
            data: updatedUser,
            message: "Student Details Updated Successfully",
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
const sendOTPPRESET = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const isStudentFound = yield prisma.students.findUnique({
            where: {
                Email: email,
            },
        });
        if (isStudentFound && isStudentFound.isEmailVerified === 1) {
            const otpToken = `${Math.floor(1000 + Math.random() * 9000)}`;
            const updateStudentWithOtp = yield prisma.students.update({
                where: {
                    Student_Id: Number(isStudentFound.Student_Id),
                },
                data: {
                    OTP: Number(otpToken),
                    OTP_EXPIRY: (Date.now() + 10 * 60 * 1000).toString(),
                },
            });
            if (updateStudentWithOtp) {
                try {
                    yield (0, SendMail_1.sendEmail)({
                        email,
                        subject: "Passowrd Reset Token - " + updateStudentWithOtp.First_Name,
                        message: `<html>
            <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #f2f2f2; padding: 20px; color: #333; margin: 0;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="padding: 20px;">
                    <h1 style="text-align: center; color: #007bff; margin-bottom: 20px;">Activate Your Account</h1>
                    <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.8;">
                      Dear ${updateStudentWithOtp.First_Name},<br>
                      You are receiving this email because you have requested to reset your password.<br>
                      Your OTP token is: <strong><span style="color: #007bff;">${updateStudentWithOtp.OTP}</span></strong><br>
                      Your token will expire in 10 minutes.<br><br>
                      Best Regards,<br>
                      Aroma School
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
                    <p style="font-style: italic; color: #555;">- Aroma School</p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `,
                    });
                    res.status(200).json({
                        status: true,
                        data: updateStudentWithOtp,
                        message: "OTP has been sent successfully",
                    });
                }
                catch (error) {
                    res.status(500).json({
                        status: false,
                        message: error.message,
                    });
                }
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "System can't generate OTP",
                });
            }
        }
        else {
            res.status(404).json({
                status: false,
                message: "Student Not Found or not Activated",
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
exports.sendOTPPRESET = sendOTPPRESET;
const newPasswordReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, password } = req.body;
        const hashedPassword = yield bcrypt_1.default.hash(password, Number(process.env.BCRYPT_SALT_ROUND));
        const updatedUser = yield prisma.students.update({
            where: {
                Student_Id: Number(id),
            },
            data: {
                Password: hashedPassword,
            },
        });
        if (updatedUser) {
            res.status(200).json({
                status: true,
                message: "Password Changed Successfully",
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
exports.newPasswordReq = newPasswordReq;
//# sourceMappingURL=student.controller.js.map