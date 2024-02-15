"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const book_controller_1 = require("../Controller/book.controller");
const router = (0, express_1.Router)();
router.get("/", book_controller_1.getAllBooks);
router.post("/add", book_controller_1.addBook);
router.post("/edit/:id", book_controller_1.editBook);
router.delete("/delete/:id", book_controller_1.deleteBook);
exports.default = router;
//# sourceMappingURL=book.route.js.map