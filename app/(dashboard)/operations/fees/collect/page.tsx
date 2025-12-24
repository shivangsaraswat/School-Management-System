import { requireOperations } from "@/lib/dal";
import { getCurrentAcademicYear } from "@/lib/actions/settings";
import { getStudentById } from "@/lib/actions/students";
import { getStudentFeeAccount } from "@/lib/actions/fee-accounts";
import { CollectFeeClient } from "./client";

interface PageProps {
    searchParams: Promise<{ student?: string }>;
}

export default async function CollectFeePage({ searchParams }: PageProps) {
    await requireOperations();

    const { student: studentId } = await searchParams;
    const currentYear = await getCurrentAcademicYear();

    // If a student ID is provided in URL, pre-fetch their data
    let preSelectedStudent = null;
    if (studentId) {
        const student = await getStudentById(studentId);
        const feeAccount = await getStudentFeeAccount(studentId, currentYear);

        if (student) {
            preSelectedStudent = {
                student: {
                    id: student.id,
                    admissionNumber: student.admissionNumber,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    className: student.className,
                    section: student.section,
                },
                feeAccount: feeAccount
                    ? {
                        id: feeAccount.id,
                        totalFee: feeAccount.totalFee,
                        totalPaid: feeAccount.totalPaid,
                        balance: feeAccount.balance,
                        status: feeAccount.status as "pending" | "partial" | "paid" | "overdue",
                    }
                    : null,
            };
        }
    }

    return (
        <CollectFeeClient
            currentYear={currentYear}
            preSelectedStudent={preSelectedStudent}
        />
    );
}
