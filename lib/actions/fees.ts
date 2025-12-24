"use server";

import { db } from "@/db";
import { fees, feeTypes, students, feeStructures, studentFeeAccounts } from "@/db/schema";
import { eq, and, ne, sql, count, sum, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAuth, requireOperations } from "@/lib/dal";
import { createAuditLog } from "@/lib/internal/audit";

// ============================================
// GET FEE STATISTICS
// ============================================
export async function getFeeStatistics(academicYear?: string) {
    await requireOperations();
    const year = academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    // Total collected
    const collectedResult = await db
        .select({
            total: sql<string>`COALESCE(SUM(CAST(${fees.paidAmount} AS DECIMAL)), 0)`,
        })
        .from(fees)
        .where(eq(fees.academicYear, year));

    // Total pending
    const pendingResult = await db
        .select({
            total: sql<string>`COALESCE(SUM(CAST(${fees.amount} AS DECIMAL) - CAST(${fees.paidAmount} AS DECIMAL)), 0)`,
        })
        .from(fees)
        .where(and(eq(fees.academicYear, year), eq(fees.status, "pending")));

    // Total overdue
    const overdueResult = await db
        .select({
            total: sql<string>`COALESCE(SUM(CAST(${fees.amount} AS DECIMAL) - CAST(${fees.paidAmount} AS DECIMAL)), 0)`,
        })
        .from(fees)
        .where(and(eq(fees.academicYear, year), eq(fees.status, "overdue")));

    return {
        collected: parseFloat(collectedResult[0]?.total || "0"),
        pending: parseFloat(pendingResult[0]?.total || "0"),
        overdue: parseFloat(overdueResult[0]?.total || "0"),
    };
}

// ============================================
// GET FEES BY STUDENT
// ============================================
export async function getFeesByStudent(studentId: string) {
    await requireAuth();
    const result = await db
        .select({
            id: fees.id,
            amount: fees.amount,
            paidAmount: fees.paidAmount,
            status: fees.status,
            dueDate: fees.dueDate,
            paidDate: fees.paidDate,
            month: fees.month,
            academicYear: fees.academicYear,
            receiptNumber: fees.receiptNumber,
            feeType: {
                id: feeTypes.id,
                name: feeTypes.name,
            },
        })
        .from(fees)
        .leftJoin(feeTypes, eq(fees.feeTypeId, feeTypes.id))
        .where(eq(fees.studentId, studentId))
        .orderBy(desc(fees.dueDate));

    return result;
}

// ============================================
// GET RECENT FEE COLLECTIONS
// ============================================
export async function getRecentFeeCollections(limit: number = 5) {
    await requireOperations();
    const result = await db
        .select({
            id: fees.id,
            studentId: fees.studentId,
            studentName: sql<string>`CONCAT(${students.firstName}, ' ', ${students.lastName})`,
            className: students.className,
            section: students.section,
            amount: fees.paidAmount,
            paidDate: fees.paidDate,
            receiptNumber: fees.receiptNumber,
        })
        .from(fees)
        .leftJoin(students, eq(fees.studentId, students.id))
        .where(eq(fees.status, "paid"))
        .orderBy(desc(fees.paidDate))
        .limit(limit);

    return result;
}

// ============================================
// GET STUDENT FEE STATUS
// ============================================
export async function getStudentFeeStatus(studentId: string) {
    await requireAuth();
    const result = await db
        .select({
            status: fees.status,
            count: count(),
        })
        .from(fees)
        .where(eq(fees.studentId, studentId))
        .groupBy(fees.status);

    const statusMap = result.reduce((acc, r) => {
        acc[r.status] = r.count;
        return acc;
    }, {} as Record<string, number>);

    if (statusMap["overdue"] && statusMap["overdue"] > 0) {
        return "overdue";
    }
    if (statusMap["pending"] && statusMap["pending"] > 0) {
        return "pending";
    }
    if (statusMap["partial"] && statusMap["partial"] > 0) {
        return "partial";
    }
    return "paid";
}

// ============================================
// CREATE FEE RECORD
// ============================================
export async function createFeeRecord(data: {
    studentId: string;
    feeTypeId: string;
    amount: string;
    dueDate: string;
    month: string;
    academicYear: string;
}) {
    const currentUser = await requireOperations();

    const result = await db
        .insert(fees)
        .values({
            ...data,
            paidAmount: "0",
            status: "pending",
        })
        .returning();

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "fee",
        entityId: result[0].id,
        description: `Created fee record for month ${data.month} - Year ${data.academicYear}`,
        newValue: JSON.stringify(result[0]),
    });

    revalidatePath("/operations/fees");
    return { success: true, fee: result[0] };
}

// ============================================
// RECORD FEE PAYMENT
// ============================================
export async function recordFeePayment(
    feeId: string,
    paymentData: {
        amount: string;
        paymentMethod: string;
        collectedBy: string;
    }
) {
    const currentUser = await requireOperations();

    const feeRecord = await db.select().from(fees).where(eq(fees.id, feeId)).limit(1);

    if (!feeRecord.length) {
        return { success: false, error: "Fee record not found" };
    }

    const currentFee = feeRecord[0];
    const currentPaid = parseFloat(currentFee.paidAmount);
    const totalAmount = parseFloat(currentFee.amount);
    const newPayment = parseFloat(paymentData.amount);
    const newPaidTotal = currentPaid + newPayment;

    let newStatus: "pending" | "partial" | "paid" = "pending";
    if (newPaidTotal >= totalAmount) {
        newStatus = "paid";
    } else if (newPaidTotal > 0) {
        newStatus = "partial";
    }

    // Generate receipt number
    const receiptNumber = `RCP${Date.now()}`;

    const result = await db
        .update(fees)
        .set({
            paidAmount: newPaidTotal.toFixed(2),
            status: newStatus,
            paidDate: new Date().toISOString().split("T")[0],
            receiptNumber,
            paymentMethod: paymentData.paymentMethod,
            collectedBy: paymentData.collectedBy,
            updatedAt: new Date(),
        })
        .where(eq(fees.id, feeId))
        .returning();

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "UPDATE",
        entityType: "fee",
        entityId: feeId,
        description: `Fee payment recorded: ${paymentData.amount} (Receipt: ${receiptNumber})`,
        oldValue: JSON.stringify(currentFee),
        newValue: JSON.stringify(result[0]),
    });

    revalidatePath("/operations/fees");
    return { success: true, fee: result[0], receiptNumber };
}

// ============================================
// NEW BALANCE-BASED FEE COLLECTION SYSTEM
// ============================================

import { feeTransactions, feeAdjustments } from "@/db/schema";
import { getStudentFeeAccount, updateFeeAccountBalance } from "./fee-accounts";

// ============================================
// GENERATE RECEIPT NUMBER
// ============================================
export async function generateReceiptNumber(
    schoolCode: string = "PTBS",
    academicYear: string
): Promise<string> {
    // Format: PTBS/2025-26/FEE/00001
    const yearPart = academicYear.replace("-", "-");

    // Get count of existing transactions for this year
    const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(feeTransactions)
        .where(eq(feeTransactions.academicYear, academicYear));

    const count = (countResult[0]?.count || 0) + 1;
    const paddedCount = count.toString().padStart(5, "0");

    return `${schoolCode}/${yearPart}/FEE/${paddedCount}`;
}

// ============================================
// COLLECT FEE - Main Payment Flow
// ============================================
export async function collectFee(data: {
    studentId: string;
    academicYear: string;
    amount: string;
    paymentMode: "cash" | "upi" | "bank_transfer" | "cheque" | "online";
    paymentFor?: string;
    remarks?: string;
    paidMonths?: string[];
}) {
    const currentUser = await requireOperations();

    // Get student's fee account
    const feeAccount = await getStudentFeeAccount(data.studentId, data.academicYear);
    if (!feeAccount) {
        return {
            success: false,
            error: "No fee account found for this student. Please ensure fee structure is set up.",
        };
    }

    // Calculate new balances
    const currentPaid = parseFloat(feeAccount.totalPaid);
    const totalFee = parseFloat(feeAccount.totalFee);
    const paymentAmount = parseFloat(data.amount);

    if (paymentAmount <= 0) {
        return { success: false, error: "Payment amount must be greater than 0" };
    }

    const newPaidAmount = currentPaid + paymentAmount;
    const newBalance = totalFee - newPaidAmount;

    // Determine new status
    let newStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
    if (newPaidAmount >= totalFee) {
        newStatus = "paid";
    } else if (newPaidAmount > 0) {
        newStatus = "partial";
    }

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber("PTBS", data.academicYear);

    // Create transaction record
    const transaction = await db
        .insert(feeTransactions)
        .values({
            studentId: data.studentId,
            feeAccountId: feeAccount.id,
            academicYear: data.academicYear,
            amountPaid: data.amount,
            paymentMode: data.paymentMode,
            receiptNumber,
            paymentFor: data.paymentFor,
            remarks: data.remarks,
            paidMonths: data.paidMonths || [],
            collectedBy: currentUser.id,
        })
        .returning();

    // Calculate new paid months list
    const currentPaidMonths = (feeAccount.paidMonths as string[]) || [];
    const newPaidMonthsSet = new Set([...currentPaidMonths, ...(data.paidMonths || [])]);
    const newPaidMonths = Array.from(newPaidMonthsSet);

    // Update fee account balance
    await updateFeeAccountBalance(
        feeAccount.id,
        newPaidAmount.toFixed(2),
        newBalance.toFixed(2),
        newStatus,
        newPaidMonths
    );

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "fee_transaction",
        entityId: transaction[0].id,
        description: `Fee collected: ₹${data.amount} (Receipt: ${receiptNumber})`,
        newValue: JSON.stringify(transaction[0]),
    });

    revalidatePath("/operations/fees");
    revalidatePath("/operations/fees/transactions");
    revalidatePath("/operations/fees/collect");

    return {
        success: true,
        transaction: transaction[0],
        receiptNumber,
        newBalance: newBalance.toFixed(2),
        newStatus,
    };
}

// ============================================
// GET FEE TRANSACTIONS (New System)
// ============================================
export async function getFeeTransactionsNew(
    academicYear?: string,
    studentId?: string,
    limit?: number
) {
    await requireOperations();

    const conditions = [];
    if (academicYear) {
        conditions.push(eq(feeTransactions.academicYear, academicYear));
    }
    if (studentId) {
        conditions.push(eq(feeTransactions.studentId, studentId));
    }

    const query = db
        .select({
            transaction: feeTransactions,
            student: {
                id: students.id,
                admissionNumber: students.admissionNumber,
                firstName: students.firstName,
                lastName: students.lastName,
                className: students.className,
                section: students.section,
            },
        })
        .from(feeTransactions)
        .leftJoin(students, eq(feeTransactions.studentId, students.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(feeTransactions.transactionDate));

    if (limit) {
        return await query.limit(limit);
    }
    return await query;
}

// ============================================
// GET TRANSACTION BY RECEIPT NUMBER
// ============================================
export async function getTransactionByReceiptNumber(receiptNumber: string) {
    await requireOperations();

    const result = await db
        .select({
            transaction: feeTransactions,
            student: {
                id: students.id,
                admissionNumber: students.admissionNumber,
                firstName: students.firstName,
                lastName: students.lastName,
                className: students.className,
                section: students.section,
                guardianName: students.guardianName,
                guardianPhone: students.guardianPhone,
            },
            account: studentFeeAccounts,
        })
        .from(feeTransactions)
        .leftJoin(students, eq(feeTransactions.studentId, students.id))
        .leftJoin(studentFeeAccounts, eq(feeTransactions.feeAccountId, studentFeeAccounts.id))
        .where(eq(feeTransactions.receiptNumber, receiptNumber))
        .limit(1);

    return result[0] || null;
}

// ============================================
// CREATE FEE ADJUSTMENT (Discount/Refund)
// ============================================
export async function createFeeAdjustment(data: {
    studentId: string;
    academicYear: string;
    amount: string; // Positive = add to fee, Negative = discount
    reason: string;
}) {
    const currentUser = await requireOperations();

    // Get student's fee account
    const feeAccount = await getStudentFeeAccount(data.studentId, data.academicYear);
    if (!feeAccount) {
        return {
            success: false,
            error: "No fee account found for this student.",
        };
    }

    // Create adjustment record
    const adjustment = await db
        .insert(feeAdjustments)
        .values({
            studentId: data.studentId,
            feeAccountId: feeAccount.id,
            academicYear: data.academicYear,
            amount: data.amount,
            reason: data.reason,
            approvedBy: currentUser.id,
        })
        .returning();

    // Update fee account
    const adjustmentAmount = parseFloat(data.amount);
    const currentTotal = parseFloat(feeAccount.totalFee);
    const currentPaid = parseFloat(feeAccount.totalPaid);
    const newTotal = currentTotal + adjustmentAmount;
    const newBalance = newTotal - currentPaid;

    // Determine new status
    let newStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
    if (currentPaid >= newTotal) {
        newStatus = "paid";
    } else if (currentPaid > 0) {
        newStatus = "partial";
    }

    await db
        .update(studentFeeAccounts)
        .set({
            totalFee: newTotal.toFixed(2),
            balance: newBalance.toFixed(2),
            status: newStatus,
            updatedAt: new Date(),
        })
        .where(eq(studentFeeAccounts.id, feeAccount.id));

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "fee_adjustment",
        entityId: adjustment[0].id,
        description: `Fee adjustment: ₹${data.amount} - Reason: ${data.reason}`,
        newValue: JSON.stringify(adjustment[0]),
    });

    revalidatePath("/operations/fees");
    return { success: true, adjustment: adjustment[0] };
}

// ============================================
// SEARCH STUDENTS FOR FEE COLLECTION
// Auto-creates fee accounts for students if fee structure exists
// ============================================
export async function searchStudentsForFeeCollection(
    query: string,
    academicYear: string
) {
    await requireOperations();

    if (!query || query.length < 2) {
        return [];
    }

    const searchPattern = `%${query.toLowerCase()}%`;

    // Get students matching the search
    const studentsResult = await db
        .select({
            id: students.id,
            admissionNumber: students.admissionNumber,
            firstName: students.firstName,
            lastName: students.lastName,
            className: students.className,
            section: students.section,
        })
        .from(students)
        .where(
            and(
                eq(students.isActive, true),
                sql`(
                    LOWER(${students.firstName}) LIKE ${searchPattern} OR
                    LOWER(${students.lastName}) LIKE ${searchPattern} OR
                    LOWER(${students.admissionNumber}) LIKE ${searchPattern} OR
                    LOWER(CONCAT(${students.firstName}, ' ', ${students.lastName})) LIKE ${searchPattern}
                )`
            )
        )
        .limit(10);

    // For each student, get or auto-create fee account
    const results = await Promise.all(
        studentsResult.map(async (student) => {
            // Check if fee account exists
            let feeAccount = await db
                .select()
                .from(studentFeeAccounts)
                .where(
                    and(
                        eq(studentFeeAccounts.studentId, student.id),
                        eq(studentFeeAccounts.academicYear, academicYear)
                    )
                )
                .limit(1);

            // If no account, try to auto-create
            if (feeAccount.length === 0) {
                const feeStructure = await db
                    .select()
                    .from(feeStructures)
                    .where(
                        and(
                            eq(feeStructures.className, student.className),
                            eq(feeStructures.academicYear, academicYear),
                            eq(feeStructures.isActive, true)
                        )
                    )
                    .limit(1);

                if (feeStructure.length > 0) {
                    // Auto-create fee account
                    feeAccount = await db
                        .insert(studentFeeAccounts)
                        .values({
                            studentId: student.id,
                            academicYear,
                            totalFee: feeStructure[0].totalFee,
                            totalPaid: "0",
                            balance: feeStructure[0].totalFee,
                            status: "pending",
                        })
                        .returning();
                    console.log(`Auto-created fee account for ${student.firstName} ${student.lastName}`);
                }
            }

            return {
                student,
                feeAccount: feeAccount[0] || null,
            };
        })
    );

    return results;
}

// ============================================
// DELETE FEE TRANSACTION
// ============================================
export async function deleteFeeTransaction(transactionId: string) {
    const currentUser = await requireOperations();

    // 1. Get transaction to be deleted
    const transactionsList = await db.select().from(feeTransactions).where(eq(feeTransactions.id, transactionId));
    const transaction = transactionsList[0];

    if (!transaction) {
        return { success: false, error: "Transaction not found" };
    }

    // 2. Get fee account
    const accountsList = await db.select().from(studentFeeAccounts).where(eq(studentFeeAccounts.id, transaction.feeAccountId));
    const feeAccount = accountsList[0];

    if (!feeAccount) {
        return { success: false, error: "Fee account not found" };
    }

    // 3. Delete transaction
    await db.delete(feeTransactions).where(eq(feeTransactions.id, transactionId));

    // 4. Recalculate balances and paid months from REMAINING transactions
    const remainingTransactions = await db.select().from(feeTransactions)
        .where(eq(feeTransactions.feeAccountId, feeAccount.id));

    let newTotalPaid = 0;
    const allPaidMonths = new Set<string>();

    for (const txn of remainingTransactions) {
        newTotalPaid += parseFloat(txn.amountPaid);
        if (txn.paidMonths && Array.isArray(txn.paidMonths)) {
            (txn.paidMonths as string[]).forEach((m) => allPaidMonths.add(m));
        }
    }

    const totalFee = parseFloat(feeAccount.totalFee);
    const newBalance = totalFee - newTotalPaid;

    let newStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
    if (newTotalPaid >= totalFee) {
        newStatus = "paid";
    } else if (newTotalPaid > 0) {
        newStatus = "partial";
    }

    // 5. Update Fee Account
    await updateFeeAccountBalance(
        feeAccount.id,
        newTotalPaid.toFixed(2),
        newBalance.toFixed(2),
        newStatus,
        Array.from(allPaidMonths)
    );

    // 6. Audit Log
    await createAuditLog({
        userId: currentUser.id,
        action: "DELETE",
        entityType: "fee_transaction",
        entityId: transactionId,
        description: `Deleted fee transaction ${transaction.receiptNumber} amount ₹${transaction.amountPaid}`,
        oldValue: JSON.stringify(transaction),
    });

    revalidatePath("/operations/fees");
    revalidatePath("/operations/fees/transactions");

    return { success: true };
}

