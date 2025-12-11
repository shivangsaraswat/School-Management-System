import { requireAuth } from "@/lib/dal";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireAuth();

    return (
        <SidebarProvider>
            <AppSidebar userRole={user.role} />
            <SidebarInset>
                <Header user={user} />
                <main className="flex flex-1 flex-col gap-4 p-4 pt-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
