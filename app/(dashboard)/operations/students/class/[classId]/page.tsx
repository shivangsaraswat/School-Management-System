import { requireOperations } from "@/lib/dal";
import { getStudents } from "@/lib/actions/students";
import { getStudentFeeStatus } from "@/lib/actions/fees";
import { ClassStudentsClient } from "./class-students-client";

interface PageProps {
    params: Promise<{ classId: string }>;
    searchParams: Promise<{ year?: string }>;
}

export default async function ClassStudentsPage({ params, searchParams }: PageProps) {
    await requireOperations();

    const { classId } = await params;
    const { year } = await searchParams;

    // Decode the classId (now just the class name, no section)
    const className = decodeURIComponent(classId);

    // Determine academic year
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const defaultYear = currentMonth < 3
        ? `${currentYear - 1}-${currentYear}`
        : `${currentYear}-${currentYear + 1}`;

    const academicYear = year || defaultYear;

    // Fetch students for this class (sections no longer used)
    const students = await getStudents({
        className,
        academicYear,
    });

    // Get fee status for each student
    const studentsWithFeeStatus = await Promise.all(
        students.map(async (student) => {
            const feeStatus = await getStudentFeeStatus(student.id);
            return {
                ...student,
                feeStatus,
            };
        })
    );

    const boysCount = students.filter(s => s.gender === "Male").length;
    const girlsCount = students.filter(s => s.gender === "Female").length;
    const feePendingCount = studentsWithFeeStatus.filter(s => s.feeStatus !== "paid").length;

    return (
        <ClassStudentsClient
            className={className}
            academicYear={academicYear}
            students={studentsWithFeeStatus}
            boysCount={boysCount}
            girlsCount={girlsCount}
            feePendingCount={feePendingCount}
        />
    );
}
