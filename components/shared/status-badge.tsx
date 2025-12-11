import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground",
                secondary: "bg-secondary text-secondary-foreground",
                destructive: "bg-destructive text-destructive-foreground",
                outline: "border border-current",
                success: "bg-green-500/10 text-green-600 dark:text-green-400",
                warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                pending: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface StatusBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
    status?: string;
}

const statusVariantMap: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
    paid: "success",
    present: "success",
    enrolled: "success",
    active: "success",
    pending: "pending",
    new: "pending",
    scheduled: "pending",
    partial: "warning",
    late: "warning",
    contacted: "warning",
    overdue: "destructive",
    absent: "destructive",
    declined: "destructive",
    leave: "secondary",
};

export function StatusBadge({
    className,
    variant,
    status,
    children,
    ...props
}: StatusBadgeProps) {
    const computedVariant = status
        ? statusVariantMap[status.toLowerCase()] || "default"
        : variant;

    const label = children || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "");

    return (
        <span className={cn(badgeVariants({ variant: computedVariant }), className)} {...props}>
            {label}
        </span>
    );
}
