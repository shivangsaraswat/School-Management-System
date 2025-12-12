"use server";

import { db } from "@/db";
import { attendance, students } from "@/db/schema";
import { eq, and, sql, count, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ============================================
// GET TODAY'S ATTENDANCE STATISTICS
// ============================================
export async function getTodayAttendanceStats() {
    const today = new Date().toISOString().split("T")[0];

    const result = await db
        .select({
            status: attendance.status,
            count: count(),
        })
        .from(attendance)
        .where(eq(attendance.date, today))
        .groupBy(attendance.status);

    const stats = result.reduce((acc, r) => {
        acc[r.status] = r.count;
        return acc;
    }, {} as Record<string, number>);

    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    const present = (stats["present"] || 0) + (stats["late"] || 0);
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : "0";

    return {
        present: stats["present"] || 0,
        absent: stats["absent"] || 0,
        late: stats["late"] || 0,
        leave: stats["leave"] || 0,
        total,
        percentage,
    };
}

// ============================================
// GET ATTENDANCE BY CLASS AND DATE
// ============================================
export async function getAttendanceByClass(
    className: string,
    section: string,
    date: string
) {
    const result = await db
        .select({
            id: attendance.id,
            studentId: attendance.studentId,
            studentName: sql<string>`CONCAT(${students.firstName}, ' ', ${students.lastName})`,
            rollNumber: students.rollNumber,
            status: attendance.status,
            remarks: attendance.remarks,
        })
        .from(attendance)
        .leftJoin(students, eq(attendance.studentId, students.id))
        .where(
            and(
                eq(attendance.date, date),
                eq(students.className, className),
                eq(students.section, section)
            )
        )
        .orderBy(students.rollNumber);

    return result;
}

// ============================================
// MARK ATTENDANCE
// ============================================
export async function markAttendance(
    records: Array<{
        studentId: string;
        status: "present" | "absent" | "late" | "leave";
        remarks?: string;
    }>,
    date: string,
    markedBy: string
) {
    // Delete existing attendance for the date and students
    const studentIds = records.map((r) => r.studentId);

    for (const studentId of studentIds) {
        await db
            .delete(attendance)
            .where(and(eq(attendance.studentId, studentId), eq(attendance.date, date)));
    }

    // Insert new records
    const insertData = records.map((record) => ({
        studentId: record.studentId,
        date,
        status: record.status,
        remarks: record.remarks || null,
        markedBy,
    }));

    await db.insert(attendance).values(insertData);

    revalidatePath("/academics/attendance");
    return { success: true, count: records.length };
}

// ============================================
// GET STUDENT ATTENDANCE HISTORY
// ============================================
export async function getStudentAttendanceHistory(
    studentId: string,
    options?: {
        startDate?: string;
        endDate?: string;
        limit?: number;
    }
) {
    const { startDate, endDate, limit = 30 } = options || {};

    const conditions = [eq(attendance.studentId, studentId)];

    if (startDate) {
        conditions.push(sql`${attendance.date} >= ${startDate}`);
    }
    if (endDate) {
        conditions.push(sql`${attendance.date} <= ${endDate}`);
    }

    const result = await db
        .select({
            id: attendance.id,
            date: attendance.date,
            status: attendance.status,
            remarks: attendance.remarks,
        })
        .from(attendance)
        .where(and(...conditions))
        .orderBy(desc(attendance.date))
        .limit(limit);

    return result;
}

// ============================================
// GET ATTENDANCE PERCENTAGE
// ============================================
export async function getAttendancePercentage(
    studentId: string,
    academicYear?: string
) {
    const year = academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    // Get start date of academic year (assuming April 1st)
    const startYear = parseInt(year.split("-")[0]);
    const startDate = `${startYear}-04-01`;

    const result = await db
        .select({
            status: attendance.status,
            count: count(),
        })
        .from(attendance)
        .where(
            and(
                eq(attendance.studentId, studentId),
                sql`${attendance.date} >= ${startDate}`
            )
        )
        .groupBy(attendance.status);

    const stats = result.reduce((acc, r) => {
        acc[r.status] = r.count;
        return acc;
    }, {} as Record<string, number>);

    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    const present = (stats["present"] || 0) + (stats["late"] || 0);

    return total > 0 ? ((present / total) * 100).toFixed(1) : "0";
}
