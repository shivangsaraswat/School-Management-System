import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/dal";
import { canViewRevenue } from "@/lib/permissions";
import { getRevenueStatistics, getMonthlyCollectionData, getFeeCollectionByClass } from "@/lib/actions/revenue";
import RevenueDashboardClient from "./client";

export default async function RevenueDashboard() {
    const user = await requireAuth();

    if (!canViewRevenue(user.role)) {
        redirect("/");
    }

    // Fetch real data from database
    const [stats, monthlyData, classData] = await Promise.all([
        getRevenueStatistics(),
        getMonthlyCollectionData(),
        getFeeCollectionByClass(),
    ]);

    return (
        <RevenueDashboardClient
            stats={stats}
            monthlyData={monthlyData}
            classData={classData}
        />
    );
}
