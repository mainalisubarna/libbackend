"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../Controller/user.controller");
const Authorization_middleware_1 = require("../Middlewares/Authorization.middleware");
const multer_middleware_1 = require("../Middlewares/multer.middleware");
const bookTransaction_controller_1 = require("../Controller/bookTransaction.controller");
const router = (0, express_1.Router)();
router.post("/login", user_controller_1.processLogin);
router.get("/me", user_controller_1.getMyInfo);
router.post("/user/edit/password", Authorization_middleware_1.AuthenticateUser, multer_middleware_1.upload.single("photo"), user_controller_1.userPassAvatarChange);
router.post("/user/profile/update", Authorization_middleware_1.AuthenticateUser, multer_middleware_1.upload.single("photo"), user_controller_1.userProfilePicUpdate);
router.get("/getDashboardInfo", Authorization_middleware_1.AuthenticateUser, bookTransaction_controller_1.getDashboardInfo);
router.post("/getStudentDashboardInfo", Authorization_middleware_1.AuthenticateUser, bookTransaction_controller_1.getStudentDashboardInfo);
router.get("/makespenalty", bookTransaction_controller_1.makesPenalty);
exports.default = router;
//# sourceMappingURL=user.route.js.map