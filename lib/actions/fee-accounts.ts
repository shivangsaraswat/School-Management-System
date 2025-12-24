"use server";

import { db } from "@/db";
import { studentFeeAccounts, students, feeStructures, feeTransactions, feeAdjustments } from "@/db/schema";
import { eq, and, desc, sql, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireOperations } from "@/lib/dal";
import { createAuditLog } from "@/lib/internal/audit";

// ============================================
// GET STUDENT FEE ACCOUNT (with auto-creation)
// Automatically creates fee account if it doesn't exist
// but fee structure is available for the student's class
// ============================================
export async function getStudentFeeAccount(studentId: string, academicYear: string) {
    await requireOperations();

    // First, try to get existing account
    const existing = await db
        .select()
        .from(studentFeeAccounts)
        .where(
            and(
                eq(studentFeeAccounts.studentId, studentId),
                eq(studentFeeAccounts.academicYear, academicYear)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        return existing[0];
    }

    // No account exists - try to auto-create one
    // First, get the student's class
    const student = await db
        .select({ className: students.className })
        .from(students)
        .where(eq(students.id, studentId))
        .limit(1);

    if (!student.length) {
        return null;
    }

    // Check if fee structure exists for this class
    const feeStructure = await db
        .select()
        .from(feeStructures)
        .where(
            and(
                eq(feeStructures.className, student[0].className),
                eq(feeStructures.academicYear, academicYear),
                eq(feeStructures.isActive, true)
            )
        )
        .limit(1);

    if (!feeStructure.length) {
        // No fee structure defined for this class
        return null;
    }

    // Auto-create the fee account
    const newAccount = await db
        .insert(studentFeeAccounts)
        .values({
            studentId,
            academicYear,
            totalFee: feeStructure[0].totalFee,
            totalPaid: "0",
            balance: feeStructure[0].totalFee,
            status: "pending",
        })
        .returning();

    console.log(`Auto-created fee account for student ${studentId} - ${academicYear}`);

    return newAccount[0];
}

// ============================================
// GET STUDENT FEE ACCOUNTS WITH STUDENT INFO
// ============================================
export async function getStudentFeeAccountsWithInfo(academicYear?: string) {
    await requireOperations();

    const conditions = academicYear
        ? eq(studentFeeAccounts.academicYear, academicYear)
        : undefined;

    const result = await db
        .select({
            account: studentFeeAccounts,
            student: {
                id: students.id,
                admissionNumber: students.admissionNumber,
                firstName: students.firstName,
                lastName: students.lastName,
                className: students.className,
                section: students.section,
            },
        })
        .from(studentFeeAccounts)
        .leftJoin(students, eq(studentFeeAccounts.studentId, students.id))
        .where(conditions)
        .orderBy(desc(studentFeeAccounts.balance));

    return result;
}

// ============================================
// CREATE STUDENT FEE ACCOUNT
// ============================================
export async function createStudentFeeAccount(
    studentId: string,
    academicYear: string,
    totalFee: string
) {
    const currentUser = await requireOperations();

    // Check if account already exists
    const existing = await getStudentFeeAccount(studentId, academicYear);
    if (existing) {
        return {
            success: false,
            error: `Fee account already exists for this student in ${academicYear}`,
        };
    }

    const result = await db
        .insert(studentFeeAccounts)
        .values({
            studentId,
            academicYear,
            totalFee,
            totalPaid: "0",
            balance: totalFee, // Initially balance = totalFee
            status: "pending",
        })
        .returning();

    // Log action
    await createAuditLog({
        userId: currentUser.id,
        action: "CREATE",
        entityType: "student_fee_account",
        entityId: result[0].id,
        description: `Created fee account for student - Total: ₹${totalFee}`,
        newValue: JSON.stringify(result[0]),
    });

    revalidatePath("/operations/fees");
    return { success: true, account: result[0] };
}

// ============================================
// AUTO-CREATE FEE ACCOUNT FOR NEW STUDENT
// ============================================
export async function autoCreateFeeAccountForStudent(
    studentId: string,
    className: string,
    academicYear: string
) {
    // Check if fee structure exists for this class
    const feeStructure = await db
        .select()
        .from(feeStructures)
        .where(
            and(
                eq(feeStructures.className, className),
                eq(feeStructures.academicYear, academicYear),
                eq(feeStructures.isActive, true)
            )
        )
        .limit(1);

    if (!feeStructure.length) {
        // No fee structure defined, skip account creation
        console.log(`No fee structure found for ${className} - ${academicYear}`);
        return { success: false, reason: "no_fee_structure" };
    }

    // Check if account already exists
    const existing = await db
        .select()
        .from(studentFeeAccounts)
        .where(
            and(
                eq(studentFeeAccounts.studentId, studentId),
                eq(studentFeeAccounts.academicYear, academicYear)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        return { success: false, reason: "already_exists" };
    }

    // Create the fee account
    const result = await db
        .insert(studentFeeAccounts)
        .values({
            studentId,
            academicYear,
            totalFee: feeStructure[0].totalFee,
            totalPaid: "0",
            balance: feeStructure[0].totalFee,
            status: "pending",
        })
        .returning();

    // Note: We don't create audit log here as this is an automated action
    // The student creation audit log will suffice

    revalidatePath("/operations/fees");
    return { success: true, account: result[0] };
}

// ============================================
// CREATE FEE ACCOUNTS FOR ALL EXISTING STUDENTS IN A CLASS
// Called when a new fee structure is created
// ============================================
export async function createFeeAccountsForExistingStudents(
    className: string,
    academicYear: string,
    totalFee: string
) {
    // Get all active students in this class
    const studentsInClass = await db
        .select({ id: students.id })
        .from(students)
        .where(
            and(
                eq(students.className, className),
                eq(students.isActive, true)
            )
        );

    if (studentsInClass.length === 0) {
        return { success: true, created: 0, message: "No students in this class" };
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const student of studentsInClass) {
        // Check if account already exists
        const existing = await db
            .select({ id: studentFeeAccounts.id })
            .from(studentFeeAccounts)
            .where(
                and(
                    eq(studentFeeAccounts.studentId, student.id),
                    eq(studentFeeAccounts.academicYear, academicYear)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            skippedCount++;
            continue;
        }

        // Create fee account
        await db.insert(studentFeeAccounts).values({
            studentId: student.id,
            academicYear,
            totalFee,
            totalPaid: "0",
            balance: totalFee,
            status: "pending",
        });
        createdCount++;
    }

    revalidatePath("/operations/fees");
    revalidatePath("/operations/students");

    return {
        success: true,
        created: createdCount,
        skipped: skippedCount,
        total: studentsInClass.length,
    };
}

// ============================================
// UPDATE FEE ACCOUNT BALANCE
// ============================================
export async function updateFeeAccountBalance(
    accountId: string,
    newPaidAmount: string,
    newBalance: string,
    newStatus: "pending" | "partial" | "paid" | "overdue",
    newPaidMonths?: string[]
) {
    const updateData: any = {
        totalPaid: newPaidAmount,
        balance: newBalance,
        status: newStatus,
        updatedAt: new Date(),
    };

    if (newPaidMonths) {
        updateData.paidMonths = newPaidMonths;
    }

    const result = await db
        .update(studentFeeAccounts)
        .set(updateData)
        .where(eq(studentFeeAccounts.id, accountId))
        .returning();

    revalidatePath("/operations/fees");
    return result[0];
}

// ============================================
// GET STUDENTS WITH PENDING FEES
// ============================================
export async function getStudentsWithPendingFees(
    academicYear?: string,
    className?: string,
    limit?: number
) {
    await requireOperations();

    // Build conditions
    const conditions = [];
    if (academicYear) {
        conditions.push(eq(studentFeeAccounts.academicYear, academicYear));
    }
    if (className) {
        conditions.push(eq(students.className, className));
    }
    // Only pending/partial/overdue statuses
    conditions.push(
        sql`${studentFeeAccounts.status} IN ('pending', 'partial', 'overdue')`
    );

    const query = db
        .select({
            account: studentFeeAccounts,
            student: {
                id: students.id,
                admissionNumber: students.admissionNumber,
                firstName: students.firstName,
                lastName: students.lastName,
                className: students.className,
                section: students.section,
                guardianPhone: students.guardianPhone,
            },
        })
        .from(studentFeeAccounts)
        .leftJoin(students, eq(studentFeeAccounts.studentId, students.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(studentFeeAccounts.balance));

    if (limit) {
        return await query.limit(limit);
    }
    return await query;
}

// ============================================
// GET CLASS-WISE PENDING SUMMARY
// ============================================
export async function getClassWisePendingSummary(academicYear: string) {
    await requireOperations();

    const result = await db
        .select({
            className: students.className,
            totalStudents: sql<number>`COUNT(DISTINCT ${studentFeeAccounts.studentId})`,
            totalFees: sql<string>`COALESCE(SUM(CAST(${studentFeeAccounts.totalFee} AS DECIMAL)), 0)`,
            totalCollected: sql<string>`COALESCE(SUM(CAST(${studentFeeAccounts.totalPaid} AS DECIMAL)), 0)`,
            totalPending: sql<string>`COALESCE(SUM(CAST(${studentFeeAccounts.balance} AS DECIMAL)), 0)`,
        })
        .from(studentFeeAccounts)
        .leftJoin(students, eq(studentFeeAccounts.studentId, students.id))
        .where(eq(studentFeeAccounts.academicYear, academicYear))
        .groupBy(students.className)
        .orderBy(students.className);

    return result;
}

// ============================================
// GET FEE ACCOUNT STATISTICS
// ============================================
export async function getFeeAccountStatistics(academicYear: string) {
    await requireOperations();

    // Total expected
    const totalExpectedResult = await db
        .select({
            total: sql<string>`COALESCE(SUM(CAST(${studentFeeAccounts.totalFee} AS DECIMAL)), 0)`,
        })
        .from(studentFeeAccounts)
        .where(eq(studentFeeAccounts.academicYear, academicYear));

    // Total collected
    const totalCollectedResult = await db
        .select({
            total: sql<string>`COALESCE(SUM(CAST(${studentFeeAccounts.totalPaid} AS DECIMAL)), 0)`,
        })
        .from(studentFeeAccounts)
        .where(eq(studentFeeAccounts.academicYear, academicYear));

    // Total pending
    const totalPendingResult = await db
        .select({
            total: sql<string>`COALESCE(SUM(CAST(${studentFeeAccounts.balance} AS DECIMAL)), 0)`,
        })
        .from(studentFeeAccounts)
        .where(eq(studentFeeAccounts.academicYear, academicYear));

    // Student counts by status
    const statusCounts = await db
        .select({
            status: studentFeeAccounts.status,
            count: sql<number>`COUNT(*)`,
        })
        .from(studentFeeAccounts)
        .where(eq(studentFeeAccounts.academicYear, academicYear))
        .groupBy(studentFeeAccounts.status);

    const totalExpected = parseFloat(totalExpectedResult[0]?.total || "0");
    const totalCollected = parseFloat(totalCollectedResult[0]?.total || "0");
    const totalPending = parseFloat(totalPendingResult[0]?.total || "0");
    const collectionRate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100) : 0;

    return {
        totalExpected,
        totalCollected,
        totalPending,
        collectionRate: collectionRate.toFixed(1),
        statusCounts: statusCounts.reduce((acc, s) => {
            acc[s.status] = s.count;
            return acc;
        }, {} as Record<string, number>),
    };
}

// ============================================
// GET STUDENT FEE HISTORY
// ============================================
export async function getStudentFeeHistory(studentId: string, academicYear?: string) {
    await requireOperations();

    const conditions = academicYear
        ? and(
            eq(feeTransactions.studentId, studentId),
            eq(feeTransactions.academicYear, academicYear)
        )
        : eq(feeTransactions.studentId, studentId);

    const transactions = await db
        .select()
        .from(feeTransactions)
        .where(conditions)
        .orderBy(desc(feeTransactions.transactionDate));

    const adjustments = await db
        .select()
        .from(feeAdjustments)
        .where(
            academicYear
                ? and(
                    eq(feeAdjustments.studentId, studentId),
                    eq(feeAdjustments.academicYear, academicYear)
                )
                : eq(feeAdjustments.studentId, studentId)
        )
        .orderBy(desc(feeAdjustments.createdAt));

    return { transactions, adjustments };
}
