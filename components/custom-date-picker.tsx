"use client";

import * as React from "react";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CustomDatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    label?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function CustomDatePicker({
    date,
    setDate,
    label,
    placeholder = "Pick a date",
    className,
    disabled = false
}: CustomDatePickerProps) {
    const [month, setLocalMonth] = React.useState<number>(
        date ? getMonth(date) : getMonth(new Date())
    );
    const [year, setLocalYear] = React.useState<number>(
        date ? getYear(date) : getYear(new Date())
    );

    // Update internal state when prop date changes
    React.useEffect(() => {
        if (date) {
            setLocalMonth(getMonth(date));
            setLocalYear(getYear(date));
        }
    }, [date]);

    const years = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 100; // Allow dates back to 100 years ago
        const endYear = currentYear + 10;
        const yearsList = [];
        for (let i = startYear; i <= endYear; i++) {
            yearsList.push(i);
        }
        return yearsList.reverse(); // Newest first
    }, []);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(year, month, day);
        // Correct for timezone offset issues if simple Date construction causes shifts?
        // Actually local new Date(y, m, d) is usually fine for "date picker" semantics where time is 00:00 local.
        setDate(newDate);
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <div className={cn("grid gap-2", className)}>
            {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal h-10",
                            !date && "text-muted-foreground"
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4 w-[280px] sm:w-[320px]">
                        {/* Header: Month and Year Selectors */}
                        <div className="flex gap-2">
                            <Select
                                value={month.toString()}
                                onValueChange={(val) => setLocalMonth(parseInt(val))}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m, i) => (
                                        <SelectItem key={m} value={i.toString()}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={year.toString()}
                                onValueChange={(val) => setLocalYear(parseInt(val))}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Calendar Grid */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground font-medium">
                                <div>Su</div>
                                <div>Mo</div>
                                <div>Tu</div>
                                <div>We</div>
                                <div>Th</div>
                                <div>Fr</div>
                                <div>Sa</div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {paddingDays.map((_, i) => (
                                    <div key={`padding-${i}`} />
                                ))}
                                {days.map((day) => {
                                    const isSelected =
                                        date &&
                                        date.getDate() === day &&
                                        date.getMonth() === month &&
                                        date.getFullYear() === year;
                                    const isToday =
                                        new Date().getDate() === day &&
                                        new Date().getMonth() === month &&
                                        new Date().getFullYear() === year;

                                    return (
                                        <div
                                            key={day}
                                            className={cn(
                                                "h-8 w-8 flex items-center justify-center rounded-md cursor-pointer text-sm transition-all hover:bg-muted font-normal",
                                                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium",
                                                !isSelected && isToday && "bg-muted text-foreground border border-primary/20",
                                            )}
                                            onClick={() => handleDateClick(day)}
                                        >
                                            {day}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer: Today / Clear */}
                        <div className="flex justify-between border-t pt-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    setDate(undefined);
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-primary hover:text-primary/90"
                                onClick={() => {
                                    const today = new Date();
                                    setDate(today);
                                    setLocalMonth(today.getMonth());
                                    setLocalYear(today.getFullYear());
                                }}
                            >
                                Today
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
