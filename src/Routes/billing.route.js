"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billing_controller_1 = require("../Controller/billing.controller");
const router = (0, express_1.Router)();
router.get("/", billing_controller_1.getAllTransactions);
router.post("/view", billing_controller_1.getStudentTransaction);
router.post("/add", billing_controller_1.createReceipt);
router.post("/edit/:id", billing_controller_1.editTransaction);
router.delete("/delete/:id", billing_controller_1.deleteTransaction);
exports.default = router;
//# sourceMappingURL=billing.route.js.map