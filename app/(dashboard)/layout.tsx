import { requireAuth } from "@/lib/dal";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { HeaderProvider } from "@/components/dashboard/header-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireAuth();

    return (
        <SidebarProvider>
            <HeaderProvider>
                <AppSidebar userRole={user.role} variant="inset" />
                <SidebarInset>
                    <Header user={user} />
                    <main className="flex flex-1 flex-col gap-6 p-6 pt-0">
                        {children}
                    </main>
                </SidebarInset>
            </HeaderProvider>
        </SidebarProvider>
    );
}
