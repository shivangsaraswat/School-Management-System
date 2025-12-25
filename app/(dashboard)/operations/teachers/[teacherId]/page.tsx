import { notFound } from "next/navigation";
import { requireOperations } from "@/lib/dal";
import { getTeacherById } from "@/lib/actions/teachers";
import { getSchoolClasses, getAcademicYears } from "@/lib/actions/settings";
import { TeacherProfileClient } from "./teacher-profile-client";

interface TeacherProfilePageProps {
    params: Promise<{ teacherId: string }>;
}

export default async function TeacherProfilePage({ params }: TeacherProfilePageProps) {
    await requireOperations();

    const { teacherId } = await params;
    const teacher = await getTeacherById(teacherId);

    if (!teacher) {
        notFound();
    }

    // Get available classes and years for assignment
    const [schoolClasses, academicYears] = await Promise.all([
        getSchoolClasses(),
        getAcademicYears(),
    ]);

    const currentYear = academicYears[0] || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    return (
        <TeacherProfileClient
            data={teacher}
            schoolClasses={schoolClasses}
            academicYears={academicYears}
            currentYear={currentYear}
        />
    );
}
