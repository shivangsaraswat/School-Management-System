"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Search,
    ChevronRight,
    UserPlus,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
} from "lucide-react";
import { getTeachers } from "@/lib/actions/teachers";
import type { Teacher } from "@/db/schema";

interface TeachersClientProps {
    initialTeachers: Teacher[];
}

export function TeachersClient({ initialTeachers }: TeachersClientProps) {
    const router = useRouter();
    const [teachers, setTeachers] = useState(initialTeachers);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query) {
            setTeachers(initialTeachers);
            return;
        }

        try {
            const results = await getTeachers({ search: query });
            setTeachers(results);
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
    };

    return (
        <div className="space-y-4">
            {/* Search and Add Button */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, or employee ID..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button asChild>
                    <Link href="/operations/teachers/add">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add New Teacher
                    </Link>
                </Button>
            </div>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((teacher) => (
                    <Card
                        key={teacher.id}
                        className="group hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => router.push(`/operations/teachers/${teacher.id}`)}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-14 w-14 border-2 border-primary/20">
                                    <AvatarImage src={teacher.photo || ""} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {getInitials(teacher.firstName, teacher.lastName)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg truncate">
                                            {teacher.firstName} {teacher.lastName}
                                        </h3>
                                        {!teacher.isActive && (
                                            <Badge variant="destructive" className="text-[10px]">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="mt-1 space-y-1">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" />
                                            {teacher.employeeId}
                                        </p>
                                        {teacher.specialization && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <GraduationCap className="h-3 w-3" />
                                                {teacher.specialization}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                            {teacher.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {teacher.email.split("@")[0]}
                                                </span>
                                            )}
                                            {teacher.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {teacher.phone}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {teachers.length === 0 && (
                <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No teachers found</h3>
                    <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                        {searchQuery
                            ? "Try adjusting your search query"
                            : "Click 'Add New Teacher' to create your first teacher record."}
                    </p>
                    {!searchQuery && (
                        <Button asChild className="mt-4">
                            <Link href="/operations/teachers/add">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add New Teacher
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
