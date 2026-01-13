import { format } from "date-fns";

interface FeeReceiptProps {
    receiptNumber: string;
    date: Date;
    academicYear: string;
    student: {
        name: string;
        admissionNumber: string;
        className: string;
        section: string | null;
    };
    feeDetails: {
        component: string;
        amount: number;
    }[];
    totalPaid: number;
    remainingBalance: number;
    paymentMode: string;
    paidMonths?: string[];
}

export function FeeReceipt({
    receiptNumber,
    date,
    academicYear,
    student,
    feeDetails,
    totalPaid,
    remainingBalance,
    paymentMode,
    paidMonths,
}: FeeReceiptProps) {
    const paymentModeLabel: Record<string, string> = {
        cash: "Cash",
        upi: "UPI",
        bank_transfer: "Bank Transfer",
        cheque: "Cheque",
        online: "Online",
    };

    return (
        <div className="receipt-container">
            <style jsx>{`
                .receipt-container {
                    font-family: var(--font-inter), Arial, Helvetica, sans-serif;
                    font-size: 12px;
                    color: #000;
                    max-width: 800px;
                    margin: 0 auto;
                    border: 1px solid #000;
                    padding: 16px;
                    background: white;
                }

                .header {
                    text-align: center;
                    border-bottom: 1px solid #000;
                    padding-bottom: 8px;
                    margin-bottom: 16px;
                }

                .school-name {
                    font-family: var(--font-manrope), sans-serif;
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 4px;
                }

                .school-address {
                    font-size: 11px;
                }

                .receipt-title {
                    font-family: var(--font-manrope), sans-serif;
                    text-align: center;
                    font-size: 14px;
                    font-weight: bold;
                    margin: 12px 0;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                .receipt-meta {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .meta-block {
                    width: 48%;
                }

                .meta-row {
                    margin-bottom: 4px;
                }

                .label {
                    font-weight: bold;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 8px;
                }

                table th,
                table td {
                    border: 1px solid #000;
                    padding: 6px;
                    text-align: left;
                }

                table th {
                    font-family: var(--font-manrope), sans-serif;
                    background-color: #f2f2f2;
                    font-weight: bold;
                }

                .amount-cell {
                    text-align: right;
                    font-family: var(--font-manrope), sans-serif;
                    font-weight: bold;
                }

                .summary {
                    margin-top: 12px;
                    width: 100%;
                }

                .summary td {
                    padding: 6px;
                    border: none;
                }

                .summary .label-cell {
                    text-align: right;
                    width: 80%;
                }

                .summary .value-cell {
                    text-align: right;
                    width: 20%;
                    font-weight: bold;
                    font-family: var(--font-manrope), sans-serif;
                }

                .footer {
                    margin-top: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }

                .signature {
                    text-align: center;
                    width: 200px;
                }

                .signature-line {
                    border-top: 1px solid #000;
                    margin-top: 40px;
                    padding-top: 4px;
                    font-size: 11px;
                }

                .note {
                    font-size: 10px;
                    margin-top: 12px;
                }

                .paid-months {
                    margin-top: 8px;
                    font-size: 11px;
                }

                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .receipt-print-area,
                    .receipt-print-area * {
                        visibility: visible;
                    }
                    .receipt-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .receipt-container {
                        border: none;
                    }
                }
            `}</style>

            {/* HEADER */}
            <div className="header">
                <div className="school-name">PTBS School</div>
                <div className="school-address">
                    Village XYZ, District ABC, State – PINCODE
                    <br />
                    Contact: 9XXXXXXXXX
                </div>
            </div>

            <div className="receipt-title">Fee Receipt</div>

            {/* RECEIPT META */}
            <div className="receipt-meta">
                <div className="meta-block">
                    <div className="meta-row">
                        <span className="label">Receipt No:</span> {receiptNumber}
                    </div>
                    <div className="meta-row">
                        <span className="label">Date:</span> {format(date, "dd MMM yyyy")}
                    </div>
                    <div className="meta-row">
                        <span className="label">Time:</span> {format(date, "hh:mm a")}
                    </div>
                    <div className="meta-row">
                        <span className="label">Academic Year:</span> {academicYear}
                    </div>
                </div>

                <div className="meta-block">
                    <div className="meta-row">
                        <span className="label">Student Name:</span> {student.name}
                    </div>
                    <div className="meta-row">
                        <span className="label">Admission No:</span> {student.admissionNumber}
                    </div>
                    <div className="meta-row">
                        <span className="label">Class & Section:</span> {student.className}
                        {student.section ? ` – ${student.section}` : ""}
                    </div>
                </div>
            </div>

            {/* FEE DETAILS */}
            <table>
                <thead>
                    <tr>
                        <th style={{ width: "60%" }}>Fee Component</th>
                        <th style={{ width: "40%" }} className="amount-cell">
                            Amount (₹)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {feeDetails.map((item, index) => (
                        <tr key={index}>
                            <td>{item.component}</td>
                            <td className="amount-cell">
                                {item.amount.toLocaleString("en-IN")}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* PAID MONTHS */}
            {paidMonths && paidMonths.length > 0 && (
                <div className="paid-months">
                    <span className="label">Months Covered:</span> {paidMonths.join(", ")}
                </div>
            )}

            {/* SUMMARY */}
            <table className="summary">
                <tbody>
                    <tr>
                        <td className="label-cell">Total Amount Paid:</td>
                        <td className="value-cell">₹{totalPaid.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                        <td className="label-cell">Remaining Balance:</td>
                        <td className="value-cell">₹{remainingBalance.toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                        <td className="label-cell">Payment Mode:</td>
                        <td className="value-cell">{paymentModeLabel[paymentMode] || paymentMode}</td>
                    </tr>
                </tbody>
            </table>

            {/* FOOTER */}
            <div className="footer">
                <div className="note">
                    This is a system generated receipt.
                    <br />
                    Please retain this for future reference.
                </div>

                <div className="signature">
                    <div className="signature-line">Authorized Signature</div>
                </div>
            </div>
        </div>
    );
}

// Wrapper component for printing
export function PrintableFeeReceipt(props: FeeReceiptProps) {
    return (
        <div className="receipt-print-area">
            <FeeReceipt {...props} />
        </div>
    );
}
