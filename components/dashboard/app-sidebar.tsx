"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    BookOpen,
    ClipboardCheck,
    FileText,
    LayoutDashboard,
    Receipt,
    Settings,
    Shield,
    UserPlus,
    Users,
    BarChart3,
    GraduationCap,
    Award
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar"

import {
    canAccessSuperAdmin,
    canAccessOperations,
    canAccessAcademics,
    canAccessStudentPortal
} from "@/lib/permissions";
import { ROLES, type Role } from "@/lib/constants";

export function AppSidebar({ userRole, ...props }: React.ComponentProps<typeof Sidebar> & { userRole: Role }) {
    const pathname = usePathname();

    const superAdminNav = {
        label: "Administration",
        checkAccess: canAccessSuperAdmin,
        items: [
            { title: "Audit Logs", url: "/admin/audit-logs", icon: Shield },
            { title: "Revenue", url: "/admin/revenue", icon: BarChart3 },
            { title: "Settings", url: "/admin/settings", icon: Settings },
        ],
    };

    const operationsNav = {
        label: "Operations",
        checkAccess: canAccessOperations,
        items: [
            { title: "Students", url: "/operations/students", icon: Users },
            { title: "Admissions", url: "/operations/admissions", icon: UserPlus },
            { title: "Fees", url: "/operations/fees", icon: Receipt },
        ],
    };

    const academicsNav = {
        label: "Academics",
        checkAccess: canAccessAcademics,
        items: [
            { title: "Attendance", url: "/academics/attendance", icon: ClipboardCheck },
            { title: "Exams", url: "/academics/exams", icon: FileText },
            { title: "My Classes", url: "/academics/my-classes", icon: BookOpen },
        ],
    };

    const studentNav = {
        label: "Student Portal",
        checkAccess: canAccessStudentPortal,
        items: [
            { title: "My Results", url: "/student/results", icon: Award },
        ],
    };

    const groups = [];

    if (userRole !== ROLES.STUDENT) {
        groups.push({
            label: "General",
            items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
        });
    }

    if (canAccessSuperAdmin(userRole)) {
        groups.push(superAdminNav);
    }

    if (canAccessOperations(userRole)) {
        groups.push(operationsNav);
    }

    if (canAccessAcademics(userRole)) {
        groups.push(academicsNav);
    }

    if (canAccessStudentPortal(userRole)) {
        groups.push(studentNav);
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={userRole === ROLES.STUDENT ? "/student/results" : "/"}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <GraduationCap className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate text-sm font-semibold">
                                        {userRole === ROLES.STUDENT ? "Student Portal" : "School System"}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground capitalize">{userRole.replace("_", " ")}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label} className="py-2">
                        <SidebarGroupLabel className="text-xs uppercase tracking-wider px-3 py-1.5">{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                                                <Link href={item.url}>
                                                    <item.icon className="size-4" />
                                                    <span className="text-sm">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter className="p-3">
                <div className="text-xs text-muted-foreground/60 text-center">
                    v1.0.0
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
