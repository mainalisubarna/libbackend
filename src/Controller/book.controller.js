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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBook = exports.editBook = exports.addBook = exports.getAllBooks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const books = yield prisma.books.findMany({
            orderBy: {
                Book_Id: "desc",
            },
        });
        const data = yield Promise.all(books.map((book) => __awaiter(void 0, void 0, void 0, function* () {
            const qtyBorrowed = yield prisma.bookTransaction.findMany({
                where: {
                    Book_Id: book.Book_Id,
                    AND: {
                        Status: "Issued",
                    },
                },
            });
            const remainingQty = book.Quantity - qtyBorrowed.length;
            const newObject = Object.assign(Object.assign({}, book), { Quantity_Remaining: remainingQty });
            return newObject;
        })));
        if (books.length > 0) {
            res.status(200).json({
                status: true,
                data,
                message: "Data Fetched Successfully",
            });
        }
        else {
            res.status(400).json({
                status: false,
                message: "Unable to find books",
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
exports.getAllBooks = getAllBooks;
const addBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Book_Name, Author_Name, Publication, Published_Date, Quantity } = req.body;
        const book = yield prisma.books.create({
            data: {
                Book_Name,
                Author_Name,
                Publication,
                Published_Date,
                Quantity: Number(Quantity),
            },
        });
        res.status(200).json({
            status: true,
            data: book,
            message: "Book Added Successfully",
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
exports.addBook = addBook;
const editBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { Book_Name, Author_Name, Publication, Published_Date, Quantity } = req.body;
        const book = yield prisma.books.update({
            where: {
                Book_Id: Number(id),
            },
            data: {
                Book_Name,
                Author_Name,
                Publication,
                Published_Date,
                Quantity: Number(Quantity),
            },
        });
        res.status(200).json({
            status: true,
            data: book,
            message: "Book Details Updated Successfully",
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
exports.editBook = editBook;
const deleteBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.fineTransaction.deleteMany({
            where: {
                BookTransaction: {
                    Book: {
                        Book_Id: Number(id),
                    },
                },
            },
        });
        yield prisma.bookTransaction.deleteMany({
            where: {
                Book_Id: Number(id),
            },
        });
        yield prisma.books.delete({
            where: {
                Book_Id: Number(id),
            },
        });
        res.status(200).json({
            status: true,
            message: "Book details has been deleted successfully",
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
exports.deleteBook = deleteBook;
//# sourceMappingURL=book.controller.js.map