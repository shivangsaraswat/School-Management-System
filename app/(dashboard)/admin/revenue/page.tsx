import { requireAdmin } from "@/lib/dal";
import RevenueDashboardClient from "./client";

export default async function RevenuePage() {
    await requireAdmin();
    return <RevenueDashboardClient />;
}
