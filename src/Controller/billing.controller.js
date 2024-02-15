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
exports.getStudentTransaction = exports.deleteTransaction = exports.editTransaction = exports.createReceipt = exports.getAllTransactions = void 0;
const client_1 = require("@prisma/client");
const SendMail_1 = require("../Service/SendMail");
const prisma = new client_1.PrismaClient();
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactions = yield prisma.fineTransaction.findMany({
            orderBy: {
                Id: "desc",
            },
            include: {
                BookTransaction: {
                    include: {
                        Student: {
                            select: {
                                Student_Id: true,
                                First_Name: true,
                                Last_Name: true,
                                Email: true,
                                Academics: true,
                            },
                        },
                        Book: {
                            select: {
                                Book_Id: true,
                                Book_Name: true,
                                Publication: true,
                                Published_Date: true,
                            },
                        },
                    },
                },
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
                message: "Unable to find the billings",
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
const createReceipt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { NepaliDate, Amount_Recieved, TransactionId } = req.body;
        const receipt = yield prisma.fineTransaction.create({
            data: {
                NepaliDate: NepaliDate,
                Amount_Recieved: Number(Amount_Recieved),
                TransactionId,
            },
            include: {
                BookTransaction: {
                    include: {
                        Student: true,
                        Book: true,
                    },
                },
            },
        });
        const message = `<html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f2f2f2; padding: 20px; color: #333; margin: 0;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
        style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
        <tr>
          <td style="padding: 20px;">
            <h1 style="text-align: center; color: #007bff; margin-bottom: 20px;">Cash Receipt</h1>
            <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.8; text-align: justify;">
              Dear ${receipt.BookTransaction.Student.First_Name},<br><br>
              We hope this email finds you well. This is to acknowledge the receipt of cash for the penalty due to the late returning of the borrowed book from Aroma School's Library. We appreciate your prompt payment.<br><br>
              <strong>Transaction Id :</strong> ${receipt.Id}<br>
              <strong>Transaction Date:</strong> ${receipt.NepaliDate}<br>
    <strong>Book Borrowed:</strong> ${receipt.BookTransaction.Book.Book_Name}<br>          
    <strong>Fine Amount:</strong> ${receipt.BookTransaction.Fine_Amt}<br>
    <strong>Total Amount Paid:</strong> Rs ${receipt.Amount_Recieved}<br>
    <strong>Balance:</strong> Rs ${receipt.BookTransaction.Fine_Amt - receipt.Amount_Recieved}<br><br>
              If you have any questions or concerns regarding this payment, please don't hesitate to contact us.<br><br>
              Thank you for your cooperation.<br><br>
              Best Regards,<br>
              Aroma Library
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
        res.status(200).json({
            status: true,
            data: receipt,
            message: "Reciept Added Successfully",
        });
        yield (0, SendMail_1.sendEmail)({
            email: receipt.BookTransaction.Student.Email,
            subject: "Receipt of Payment - " + receipt.NepaliDate,
            message,
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
exports.createReceipt = createReceipt;
const editTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { Amount_Recieved } = req.body;
        const receipt = yield prisma.fineTransaction.update({
            where: {
                Id: Number(id),
            },
            data: {
                Amount_Recieved: Number(Amount_Recieved),
            },
            include: {
                BookTransaction: {
                    include: {
                        Student: true,
                        Book: true,
                    },
                },
            },
        });
        const message = `<html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f2f2f2; padding: 20px; color: #333; margin: 0;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
        style="max-width: 600px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
        <tr>
          <td style="padding: 20px;">
            <h1 style="text-align: center; color: #007bff; margin-bottom: 20px;">Cash Receipt</h1>
            <p style="font-size: 16px; margin-bottom: 20px; line-height: 1.8; text-align: justify;">
              Dear ${receipt.BookTransaction.Student.First_Name},<br><br>
              We hope this email finds you well. This is to acknowledge the receipt of cash for the penalty due to the late returning of the borrowed book from Aroma School's Library. We appreciate your prompt payment.<br><br>
              <strong>Transaction Id :</strong> ${receipt.Id}<br>
              <strong>Transaction Date:</strong> ${receipt.NepaliDate}<br>
    <strong>Book Borrowed:</strong> ${receipt.BookTransaction.Book.Book_Name}<br>          
    <strong>Fine Amount:</strong> ${receipt.BookTransaction.Fine_Amt}<br>
    <strong>Total Amount Paid:</strong> Rs ${receipt.Amount_Recieved}<br>
    <strong>Balance:</strong> Rs ${receipt.BookTransaction.Fine_Amt - receipt.Amount_Recieved}<br><br>
              If you have any questions or concerns regarding this payment, please don't hesitate to contact us.<br><br>
              Thank you for your cooperation.<br><br>
              Best Regards,<br>
              Aroma Library
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
        res.status(200).json({
            status: true,
            data: receipt,
            message: "Reciept Added Successfully",
        });
        yield (0, SendMail_1.sendEmail)({
            email: receipt.BookTransaction.Student.Email,
            subject: "Receipt of Payment - " + receipt.NepaliDate,
            message,
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
exports.editTransaction = editTransaction;
const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.fineTransaction.delete({
            where: {
                Id: Number(id),
            },
        });
        res.status(200).json({
            status: true,
            message: "Fine Receipt has been deleted successfully",
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
const getStudentTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Student_Id } = req.body;
        const transactions = yield prisma.fineTransaction.findMany({
            where: {
                BookTransaction: {
                    Student: {
                        Student_Id: Number(Student_Id),
                    },
                },
            },
            orderBy: {
                Id: "desc",
            },
            include: {
                BookTransaction: {
                    include: {
                        Student: true,
                        Book: true,
                    },
                },
            },
        });
        if (transactions.length > 0) {
            res.status(200).json({
                status: true,
                data: transactions,
                message: "Transactions Fetched Successfully",
            });
        }
        else {
            res.status(401).json({
                status: false,
                message: "Unable to find Transactions",
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
exports.getStudentTransaction = getStudentTransaction;
//# sourceMappingURL=billing.controller.js.map