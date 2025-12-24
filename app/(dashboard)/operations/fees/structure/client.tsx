"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Pencil, Trash2, ChevronDown, IndianRupee, BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import {
    getFeeStructures,
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    copyFeeStructuresFromYear,
    getYearsWithFeeStructures,
    syncFeeAccountsForClass,
} from "@/lib/actions/fee-structure";
import { getAcademicYears, getCurrentAcademicYear } from "@/lib/actions/settings";
import { getSchoolClasses } from "@/lib/actions/settings";
import { toast } from "sonner";
import type { FeeStructure } from "@/db/schema";

interface ClassConfig {
    name: string;
    sections: string[];
}

export function FeeStructureClient({
    initialStructures,
    initialAcademicYears,
    initialCurrentYear,
    initialClasses,
}: {
    initialStructures: FeeStructure[];
    initialAcademicYears: string[];
    initialCurrentYear: string;
    initialClasses: ClassConfig[];
}) {
    const [structures, setStructures] = useState(initialStructures);
    const [selectedYear, setSelectedYear] = useState(initialCurrentYear);
    const [academicYears] = useState(initialAcademicYears);
    const [classes] = useState(initialClasses);
    const [isLoading, setIsLoading] = useState(false);

    // Dialog states
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [copyDialogOpen, setCopyDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Form states
    const [selectedClass, setSelectedClass] = useState("");
    const [totalFee, setTotalFee] = useState("");
    const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
    const [copyFromYear, setCopyFromYear] = useState("");
    const [deletingStructure, setDeletingStructure] = useState<FeeStructure | null>(null);

    // Fetch structures when year changes
    useEffect(() => {
        const fetchStructures = async () => {
            setIsLoading(true);
            try {
                const data = await getFeeStructures(selectedYear);
                setStructures(data);
            } catch (error) {
                toast.error("Failed to load fee structures");
            } finally {
                setIsLoading(false);
            }
        };
        fetchStructures();
    }, [selectedYear]);

    // Get classes that don't have a structure yet
    const availableClasses = classes.filter(
        (cls) => !structures.find((s) => s.className === cls.name)
    );

    // Handle create
    const handleCreate = async () => {
        if (!selectedClass || !totalFee) {
            toast.error("Please fill all fields");
            return;
        }

        setIsLoading(true);
        try {
            const result = await createFeeStructure({
                academicYear: selectedYear,
                className: selectedClass,
                totalFee,
            });

            if (result.success) {
                toast.success(`Fee structure created for ${selectedClass}`);
                setStructures([...structures, result.feeStructure!]);
                setAddDialogOpen(false);
                setSelectedClass("");
                setTotalFee("");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to create fee structure");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle update
    const handleUpdate = async () => {
        if (!editingStructure || !totalFee) return;

        setIsLoading(true);
        try {
            const result = await updateFeeStructure(editingStructure.id, { totalFee });

            if (result.success) {
                toast.success(`Fee structure updated for ${editingStructure.className}`);
                setStructures(
                    structures.map((s) =>
                        s.id === editingStructure.id ? result.feeStructure! : s
                    )
                );
                setEditDialogOpen(false);
                setEditingStructure(null);
                setTotalFee("");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to update fee structure");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!deletingStructure) return;

        setIsLoading(true);
        try {
            const result = await deleteFeeStructure(deletingStructure.id);

            if (result.success) {
                toast.success(`Fee structure deleted for ${deletingStructure.className}`);
                setStructures(structures.filter((s) => s.id !== deletingStructure.id));
                setDeleteDialogOpen(false);
                setDeletingStructure(null);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to delete fee structure");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle copy from previous year
    const handleCopy = async () => {
        if (!copyFromYear) {
            toast.error("Please select a year to copy from");
            return;
        }

        setIsLoading(true);
        try {
            const result = await copyFeeStructuresFromYear(copyFromYear, selectedYear);

            if (result.success) {
                toast.success(result.message);
                // Refresh structures
                const data = await getFeeStructures(selectedYear);
                setStructures(data);
                setCopyDialogOpen(false);
                setCopyFromYear("");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to copy fee structures");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle sync fee accounts for existing students
    const handleSync = async (structureId: string, className: string) => {
        setIsLoading(true);
        try {
            const result = await syncFeeAccountsForClass(structureId);

            if (result.success) {
                if (result.created && result.created > 0) {
                    toast.success(`Created ${result.created} fee account(s) for ${className}`);
                } else {
                    toast.info(`All students in ${className} already have fee accounts`);
                }
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Failed to sync fee accounts");
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: string) => {
        return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        Fee Structure
                    </h1>
                    <p className="text-muted-foreground">
                        Define fee amounts per class for each academic year
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Copy from Previous Year */}
                    <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" disabled={structures.length > 0}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy from Year
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Copy Fee Structures</DialogTitle>
                                <DialogDescription>
                                    Copy all fee structures from a previous year to {selectedYear}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label>Copy from</Label>
                                <Select value={copyFromYear} onValueChange={setCopyFromYear}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears
                                            .filter((y) => y !== selectedYear)
                                            .map((year) => (
                                                <SelectItem key={year} value={year}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setCopyDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleCopy} disabled={isLoading}>
                                    {isLoading ? "Copying..." : "Copy Structures"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add Structure */}
                    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button disabled={availableClasses.length === 0}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Structure
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Fee Structure</DialogTitle>
                                <DialogDescription>
                                    Define the total fee for a class in {selectedYear}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label>Class</Label>
                                    <Select
                                        value={selectedClass}
                                        onValueChange={setSelectedClass}
                                    >
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableClasses.map((cls) => (
                                                <SelectItem key={cls.name} value={cls.name}>
                                                    {cls.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Total Fee (₹)</Label>
                                    <div className="relative mt-2">
                                        <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="18000"
                                            className="pl-9"
                                            value={totalFee}
                                            onChange={(e) => setTotalFee(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setAddDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate} disabled={isLoading}>
                                    {isLoading ? "Creating..." : "Create"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-4">
                <Label>Academic Year:</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {academicYears.map((year) => (
                            <SelectItem key={year} value={year}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Fee Structures Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Fee Structures for {selectedYear}</CardTitle>
                    <CardDescription>
                        {structures.length} class{structures.length !== 1 ? "es" : ""} configured
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Class</TableHead>
                                <TableHead>Total Fee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {structures.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No fee structures defined for {selectedYear}.
                                        <br />
                                        <span className="text-sm">
                                            Add structures or copy from a previous year.
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                structures.map((structure) => (
                                    <TableRow key={structure.id}>
                                        <TableCell className="font-medium">
                                            {structure.className}
                                        </TableCell>
                                        <TableCell className="font-semibold text-lg">
                                            {formatCurrency(structure.totalFee)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge
                                                status={structure.isActive ? "active" : "inactive"}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Sync fee accounts for students"
                                                    onClick={() => handleSync(structure.id, structure.className)}
                                                    disabled={isLoading}
                                                >
                                                    <Users className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingStructure(structure);
                                                        setTotalFee(structure.totalFee);
                                                        setEditDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => {
                                                        setDeletingStructure(structure);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Fee Structure</DialogTitle>
                        <DialogDescription>
                            Update fee for {editingStructure?.className}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Total Fee (₹)</Label>
                        <div className="relative mt-2">
                            <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="number"
                                className="pl-9"
                                value={totalFee}
                                onChange={(e) => setTotalFee(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Fee Structure</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the fee structure for{" "}
                            {deletingStructure?.className}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
