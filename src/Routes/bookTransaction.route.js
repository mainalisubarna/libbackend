"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookTransaction_controller_1 = require("../Controller/bookTransaction.controller");
const router = (0, express_1.Router)();
router.get("/", bookTransaction_controller_1.getAllTransactions);
router.post("/view", bookTransaction_controller_1.getStudentTransaction);
router.post("/issue", bookTransaction_controller_1.issueBook);
router.post("/request", bookTransaction_controller_1.requestBook);
router.post("/edit/:id", bookTransaction_controller_1.editTransaction);
router.delete("/delete/:id", bookTransaction_controller_1.deleteTransaction);
exports.default = router;
//# sourceMappingURL=bookTransaction.route.js.map