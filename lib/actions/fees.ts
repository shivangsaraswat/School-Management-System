"use server";

import { db } from "@/db";
import { fees, feeTypes, students } from "@/db/schema";
import { eq, and, sql, count, sum, desc } from "drizzle-orm";
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
