"use server";

import { db } from "@/db";
import { fees, students } from "@/db/schema";
import { eq, sql, and, gte, lte, count, sum } from "drizzle-orm";

// ============================================
// GET REVENUE STATISTICS
// ============================================
export async function getRevenueStatistics() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // This year start (April for Indian financial year)
    const yearStart = new Date(currentMonth >= 3 ? currentYear : currentYear - 1, 3, 1);
    const yearEnd = new Date(currentMonth >= 3 ? currentYear + 1 : currentYear, 2, 31);

    // This month
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    // Last month
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0);

    // Total revenue this year (collected)
    const yearlyRevenueResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} = 'paid' THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
        })
        .from(fees)
        .where(and(
            gte(fees.paidDate, yearStart.toISOString().split('T')[0]),
            lte(fees.paidDate, yearEnd.toISOString().split('T')[0])
        ));

    // This month collected
    const thisMonthResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} = 'paid' THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
        })
        .from(fees)
        .where(and(
            gte(fees.paidDate, monthStart.toISOString().split('T')[0]),
            lte(fees.paidDate, monthEnd.toISOString().split('T')[0])
        ));

    // Last month collected
    const lastMonthResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} = 'paid' THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
        })
        .from(fees)
        .where(and(
            gte(fees.paidDate, lastMonthStart.toISOString().split('T')[0]),
            lte(fees.paidDate, lastMonthEnd.toISOString().split('T')[0])
        ));

    // Pending fees
    const pendingResult = await db
        .select({
            total: sql<number>`COALESCE(SUM(${fees.amount}::numeric), 0)`,
        })
        .from(fees)
        .where(eq(fees.status, "pending"));

    // Total fees (for collection rate)
    const totalResult = await db
        .select({
            collected: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} = 'paid' THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
            total: sql<number>`COALESCE(SUM(${fees.amount}::numeric), 0)`,
        })
        .from(fees);

    const yearly = parseFloat(String(yearlyRevenueResult[0]?.total || 0));
    const thisMonth = parseFloat(String(thisMonthResult[0]?.total || 0));
    const lastMonth = parseFloat(String(lastMonthResult[0]?.total || 0));
    const pending = parseFloat(String(pendingResult[0]?.total || 0));
    const collected = parseFloat(String(totalResult[0]?.collected || 0));
    const total = parseFloat(String(totalResult[0]?.total || 0));

    const monthChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : "0";
    const collectionRate = total > 0 ? ((collected / total) * 100).toFixed(1) : "0";

    return {
        totalRevenue: yearly,
        thisMonth,
        lastMonth,
        monthChange: parseFloat(monthChange),
        pending,
        collectionRate: parseFloat(collectionRate),
    };
}

// ============================================
// GET MONTHLY COLLECTION DATA
// ============================================
export async function getMonthlyCollectionData() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Get data for the last 9 months
    const monthlyData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 8; i >= 0; i--) {
        const targetMonth = new Date(currentYear, currentMonth - i, 1);
        const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

        const result = await db
            .select({
                collected: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} = 'paid' THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
                pending: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} = 'pending' THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
            })
            .from(fees)
            .where(and(
                gte(fees.dueDate, monthStart.toISOString().split('T')[0]),
                lte(fees.dueDate, monthEnd.toISOString().split('T')[0])
            ));

        monthlyData.push({
            month: months[targetMonth.getMonth()],
            collected: parseFloat(String(result[0]?.collected || 0)),
            pending: parseFloat(String(result[0]?.pending || 0)),
        });
    }

    return monthlyData;
}

// ============================================
// GET FEE COLLECTION BY CLASS
// ============================================
export async function getFeeCollectionByClass() {
    const result = await db
        .select({
            className: students.className,
            collected: sql<number>`COALESCE(SUM(CASE WHEN ${fees.status} = 'paid' THEN ${fees.amount}::numeric ELSE 0 END), 0)`,
            total: sql<number>`COALESCE(SUM(${fees.amount}::numeric), 0)`,
        })
        .from(fees)
        .leftJoin(students, eq(fees.studentId, students.id))
        .groupBy(students.className)
        .orderBy(students.className);

    // Calculate collection percentage for each class
    const colors = ["#3b82f6", "#22c55e", "#ea580c", "#8b5cf6", "#eab308", "#ef4444", "#06b6d4", "#f43f5e"];

    return result.map((r, i) => {
        const collected = parseFloat(String(r.collected || 0));
        const total = parseFloat(String(r.total || 0));
        const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;

        return {
            class: r.className || "Unknown",
            collected: percentage,
            fill: colors[i % colors.length],
        };
    }).filter(r => r.class !== "Unknown").slice(0, 10);
}
