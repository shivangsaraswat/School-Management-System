import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/dal";
import { canAccessAdmin } from "@/lib/permissions";
import { getAllSettings } from "@/lib/actions/settings";
import SettingsClient from "./client";

export default async function SettingsPage() {
    const user = await requireAuth();

    if (!canAccessAdmin(user.role)) {
        redirect("/");
    }

    // Fetch real settings from database
    const settings = await getAllSettings();

    return <SettingsClient initialSettings={settings} />;
}
