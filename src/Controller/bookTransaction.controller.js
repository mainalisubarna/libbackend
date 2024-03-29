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
exports.getStudentDashboardInfo = exports.getDashboardInfo = exports.getStudentTransaction = exports.requestBook = exports.makesPenalty = exports.deleteTransaction = exports.editTransaction = exports.issueBook = exports.getAllTransactions = void 0;
const client_1 = require("@prisma/client");
const nepali_date_converter_1 = __importDefault(require("nepali-date-converter"));
const SendMail_1 = require("../Service/SendMail");
const adbs = require("ad-bs-converter");
const { adToBs } = require("@sbmdkl/nepali-date-converter");
const prisma = new client_1.PrismaClient();
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield prisma.bookTransaction.findMany({
            orderBy: {
                Id: "desc",
            },
            include: {
                Book: {
                    select: {
                        Book_Name: true,
                        Book_Id: true,
                    },
                },
                Student: {
                    select: {
                        Student_Id: true,
                        First_Name: true,
                        Last_Name: true,
                    },
                },
                FineTransaction: true,
            },
        });
        if (transactions.length > 0) {
            res.status(200).json({
                status: true,
                data: transactions,
                message: "Data Fetched Successfully",
            });
        }
        else {
            res.status(400).json({
                status: false,
                message: "Unable to find transactions",
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
exports.getAllTransactions = getAllTransactions;
const issueBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Book_Id, Student_Id, Due_Date, NepaliDate } = req.body;
        const isAlreadyRequested = yield prisma.bookTransaction.findMany({
            where: {
                Student_Id: Number(Student_Id),
                Book_Id: Number(Book_Id),
                Status: {
                    not: {
                        equals: "Returned",
                    },
                },
            },
        });
        if (isAlreadyRequested.length === 0) {
            const transaction = yield prisma.bookTransaction.create({
                data: {
                    Book_Id,
                    Student_Id,
                    NepaliDate: NepaliDate,
                    Due_Date,
                    Status: "Issued",
                },
            });
            res.status(200).json({
                status: true,
                data: transaction,
                message: "Transaction Added Successfully",
            });
        }
        else {
            res.status(401).json({
                status: false,
                message: "Borrow Request already Added Successfully",
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
exports.issueBook = issueBook;
const editTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { Status, returnedAt, dueDate } = req.body;
        if (Status === "Issued") {
            const transaction = yield prisma.bookTransaction.update({
                where: {
                    Id: Number(id),
                },
                data: {
                    Status,
                    returnedAt: null,
                    Due_Date: dueDate,
                },
            });
            res.status(200).json({
                status: true,
                data: transaction,
                message: "Transaction Updated Successfully",
            });
        }
        else if (Status === "Rejected") {
            yield prisma.bookTransaction.delete({
                where: {
                    Id: Number(id),
                },
            });
            res.status(200).json({
                status: true,
                message: "Request removed Successfully",
            });
        }
        else if (Status === "Returned") {
            const transaction = yield prisma.bookTransaction.update({
                where: {
                    Id: Number(id),
                },
                data: {
                    Status,
                    returnedAt,
                },
            });
            res.status(200).json({
                status: true,
                data: transaction,
                message: "Transaction Updated Successfully",
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
exports.editTransaction = editTransaction;
const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.fineTransaction.deleteMany({
            where: {
                TransactionId: Number(id),
            },
        });
        yield prisma.bookTransaction.delete({
            where: {
                Id: Number(id),
            },
        });
        res.status(200).json({
            status: true,
            message: "Book Transaction has been deleted successfully",
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
exports.deleteTransaction = deleteTransaction;
const makesPenalty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let np = new nepali_date_converter_1.default().getBS();
        let year = np.year;
        let month = np.month;
        let day = np.date;
        np = new nepali_date_converter_1.default(year, month, day).format("YYYY-MM-DD");
        const booksTogetPenalty = yield prisma.bookTransaction.findMany({
            where: {
                Status: "Issued",
                AND: {
                    returnedAt: {
                        equals: null,
                    },
                },
            },
            include: {
                Student: true,
                Book: true,
            },
        });
        if (booksTogetPenalty.length > 0) {
            booksTogetPenalty.forEach((book) => __awaiter(void 0, void 0, void 0, function* () {
                let Fine_Amount;
                let AdDueDate;
                let AdToday;
                let dte = book.Due_Date.split("-");
                const DueDate = new nepali_date_converter_1.default(Number(dte[0]), Number(dte[1]) - 1, Number(dte[2])).format("YYYY/MM/DD");
                np = new nepali_date_converter_1.default(year, month, day).format("YYYY/MM/DD");
                AdToday =
                    adbs.bs2ad(np).year +
                        "-" +
                        adbs.bs2ad(np).month +
                        "-" +
                        adbs.bs2ad(np).day;
                AdDueDate =
                    adbs.bs2ad(DueDate).year +
                        "-" +
                        adbs.bs2ad(DueDate).month +
                        "-" +
                        adbs.bs2ad(DueDate).day;
                // Start the code here after the date is converted to Ad to get date difference
                const date1 = new Date(AdDueDate);
                const date2 = new Date(AdToday);
                const utcDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
                const utcDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
                // Calculate the difference in milliseconds
                const differenceInMilliseconds = utcDate2 - utcDate1;
                // Convert milliseconds to days
                const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
                if (differenceInDays === -1) {
                    const message = `<html>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #f2f2f2; padding: 20px; color: #333; margin: 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 20px;">
                  <h1 style="text-align: center; color: #007bff; margin-bottom: 20px;">Reminder: Book Return Notice</h1>
                  <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.8;">
                    Dear ${book.Student.First_Name},<br>
                    We hope this email finds you well. This is a friendly reminder that you borrowed the book "${book.Book.Book_Name}" from Aroma School's Library on ${book.NepaliDate}, and the due date for its return is tomorrow (${book.Due_Date}).
                    To ensure you return the book without incurring any penalty, kindly make sure to return it by the due date.<br><br>
                    We appreciate your cooperation in adhering to the due date and returning the book on time.<br><br>
                    Should you have any questions or need an extension for the book return, please contact us before the due date.<br><br>
                    Thank you for being a responsible borrower and for your continued support to Aroma School's Library.<br><br>
                    Best Regards,<br>
                    Aroma School's Library
                  </p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
                  <p style="font-style: italic; color: #555;">- Aroma School's Library</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
        `;
                    yield (0, SendMail_1.sendEmail)({
                        email: book.Student.Email.trim(),
                        subject: "Remainder Alert - " + np,
                        message,
                    });
                }
                if (differenceInDays > 0) {
                    Fine_Amount =
                        differenceInDays * Number(process.env.FINE_AMOUNT_PER_DAY);
                    const FinedTransaction = yield prisma.bookTransaction.update({
                        where: {
                            Id: Number(book.Id),
                        },
                        data: {
                            Fine_Amt: Fine_Amount,
                        },
                        include: {
                            Book: true,
                            Student: true,
                            FineTransaction: true,
                        },
                    });
                    const message = `<html>
          <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; background-color: #f2f2f2; padding: 20px; color: #333; margin: 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 20px;">
                  <h1 style="text-align: center; color: #007bff; margin-bottom: 20px;">${FinedTransaction.Book.Book_Name} Book Transaction</h1>
                  <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.8;">
                    Dear ${FinedTransaction.Student.First_Name},<br>
                    We hope this email finds you well. We would like to remind you that the ${FinedTransaction.Book.Book_Name} book was borrowed from Aroma Library on ${FinedTransaction.NepaliDate} and has not been returned yet, despite the due date being ${FinedTransaction.Due_Date}.
                    As a result, A total penalty of Rs ${FinedTransaction.Fine_Amt} has been charged against your account.<br><br>
                    Please return the book as soon as possible to avoid any additional charges. <br><br>
                    Thank you for your attention to this matter.<br><br>
                    Best Regards,<br>
                    Aroma College
                  </p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 0 0 8px 8px;">
                  <p style="font-style: italic; color: #555;">- Aroma College</p>
                </td>
              </tr>
            </table>
          </body>
          </html>`;
                    yield (0, SendMail_1.sendEmail)({
                        email: FinedTransaction.Student.Email.trim(),
                        subject: "Penalty Alert - " + np,
                        message,
                    });
                }
            }));
        }
        res.status(200).json({
            status: true,
            message: "Fine has been logged successfully",
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
exports.makesPenalty = makesPenalty;
const requestBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Book_Id, Student_Id, Due_Date } = req.body;
        const isAlreadyRequested = yield prisma.bookTransaction.findMany({
            where: {
                Student_Id: Number(Student_Id),
                Book_Id: Number(Book_Id),
                Status: {
                    not: {
                        equals: "Returned",
                    },
                },
            },
        });
        if (isAlreadyRequested.length === 0) {
            let np = new nepali_date_converter_1.default().getBS();
            let year = np.year;
            let month = np.month;
            let day = np.date;
            np = new nepali_date_converter_1.default(year, month, day).format("YYYY-MM-DD");
            const date1 = new Date(np);
            const date2 = new Date(Due_Date);
            const utcDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
            const utcDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
            // Calculate the difference in milliseconds
            const differenceInMilliseconds = utcDate2 - utcDate1;
            // Convert milliseconds to days
            const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
            if (differenceInDays <= 7) {
                const transaction = yield prisma.bookTransaction.create({
                    data: {
                        Book_Id,
                        Student_Id,
                        NepaliDate: np,
                        Due_Date,
                        Status: "Pending",
                    },
                });
                res.status(200).json({
                    status: true,
                    data: transaction,
                    message: "Borrow Request Added Successfully",
                });
            }
            else {
                res.status(401).json({
                    status: false,
                    message: "Due Date Should Not be greater than 7 Days",
                });
            }
        }
        else {
            res.status(401).json({
                status: false,
                message: "Borrow Request already Added Successfully",
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
exports.requestBook = requestBook;
const getStudentTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Student_Id } = req.body;
        const transactions = yield prisma.bookTransaction.findMany({
            where: {
                Student_Id: Number(Student_Id),
            },
            include: {
                Student: true,
                Book: true,
                FineTransaction: true,
            },
            orderBy: {
                Id: "desc",
            },
        });
        if (transactions.length > 0) {
            res.status(200).json({
                status: true,
                data: transactions,
                message: "Transactions Fetched Successfully",
            });
        }
        res.status(404).json({
            status: false,
            message: "Unable to find the transactions",
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
exports.getStudentTransaction = getStudentTransaction;
const getDashboardInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let today = new Date();
        today = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(new Date().getDate() - 5);
        const startDate = `${fiveDaysAgo.getFullYear()}-${fiveDaysAgo.getMonth() + 1}-${fiveDaysAgo.getDate()}`;
        const bsStartDate = adToBs(startDate);
        const bsEndDate = adToBs(today);
        console.log(bsStartDate, bsEndDate);
        const lineData = yield prisma.bookTransaction.groupBy({
            by: ["NepaliDate"],
            _count: {
                Id: true,
            },
            where: {
                NepaliDate: {
                    gte: bsStartDate,
                },
                AND: {
                    Status: {
                        not: {
                            equals: "Pending",
                        },
                    },
                },
            },
        });
        console.log(lineData);
        const sevenDayReport = lineData.map((data) => {
            const nepali = data.NepaliDate.split("-")[1] + "-" + data.NepaliDate.split("-")[2];
            return { date: nepali, Transactions: data._count.Id };
        });
        const totalStudents = yield prisma.students.count();
        const totalBooks = yield prisma.books.count();
        const totalBooksIssued = yield prisma.bookTransaction.count({
            where: {
                Status: "Issued",
            },
        });
        res.status(200).json({
            status: true,
            data: { sevenDayReport, totalBooks, totalStudents, totalBooksIssued },
            message: "Data fetched successfully",
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
exports.getDashboardInfo = getDashboardInfo;
const getStudentDashboardInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Student_ID } = req.body;
        let today = new Date();
        today = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(new Date().getDate() - 5);
        const startDate = `${fiveDaysAgo.getFullYear()}-${fiveDaysAgo.getMonth() + 1}-${fiveDaysAgo.getDate()}`;
        const bsStartDate = adToBs(startDate);
        const bsEndDate = adToBs(today);
        const lineData = yield prisma.bookTransaction.groupBy({
            by: ["NepaliDate"],
            _count: {
                Id: true,
            },
            where: {
                NepaliDate: {
                    gte: bsStartDate,
                    lte: bsEndDate,
                },
                AND: {
                    Status: {
                        not: {
                            equals: "Pending",
                        },
                    },
                    Student_Id: Number(Student_ID),
                },
            },
        });
        const sevenDayReport = lineData.map((data) => {
            const nepali = data.NepaliDate.split("-")[1] + "-" + data.NepaliDate.split("-")[2];
            return { date: nepali, Transactions: data._count.Id };
        });
        const totalPendingTransactions = yield prisma.bookTransaction.count({
            where: {
                Student: {
                    Student_Id: Number(Student_ID),
                },
                AND: {
                    Status: {
                        equals: "Pending",
                    },
                },
            },
        });
        const totalBooksReturned = yield prisma.bookTransaction.count({
            where: {
                Student: {
                    Student_Id: Number(Student_ID),
                },
                AND: {
                    Status: "Returned",
                },
            },
        });
        const totalBooksIssued = yield prisma.bookTransaction.count({
            where: {
                Status: "Issued",
                AND: {
                    Student: {
                        Student_Id: Number(Student_ID),
                    },
                },
            },
        });
        res.status(200).json({
            status: true,
            data: {
                sevenDayReport,
                totalPendingTransactions,
                totalBooksReturned,
                totalBooksIssued,
            },
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
exports.getStudentDashboardInfo = getStudentDashboardInfo;
//# sourceMappingURL=bookTransaction.controller.js.map