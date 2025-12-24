import { requireOperations } from "@/lib/dal";
import { getCurrentAcademicYear, getAcademicYears } from "@/lib/actions/settings";
import { getFeeTransactionsNew } from "@/lib/actions/fees";
import { TransactionsClient } from "./client";

export default async function TransactionsPage() {
    await requireOperations();

    const [currentYear, academicYears, transactions] = await Promise.all([
        getCurrentAcademicYear(),
        getAcademicYears(),
        getFeeTransactionsNew(),
    ]);

    return (
        <TransactionsClient
            initialTransactions={transactions}
            currentYear={currentYear}
            academicYears={academicYears}
        />
    );
}
