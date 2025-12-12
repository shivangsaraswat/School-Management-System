"use client";

import { BarChart3, TrendingUp, TrendingDown, Download } from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RevenueDashboardClientProps {
    stats: {
        totalRevenue: number;
        thisMonth: number;
        lastMonth: number;
        monthChange: number;
        pending: number;
        collectionRate: number;
    };
    monthlyData: Array<{
        month: string;
        collected: number;
        pending: number;
    }>;
    classData: Array<{
        class: string;
        collected: number;
        fill: string;
    }>;
}

// Helper to format currency
function formatCurrency(amount: number): string {
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
}

export default function RevenueDashboardClient({ stats, monthlyData, classData }: RevenueDashboardClientProps) {
    const statCards = [
        {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            change: "+12.5%",
            period: "this year",
            isPositive: true,
        },
        {
            title: "This Month",
            value: formatCurrency(stats.thisMonth),
            change: `${stats.monthChange >= 0 ? '+' : ''}${stats.monthChange}%`,
            period: "vs last month",
            isPositive: stats.monthChange >= 0,
        },
        {
            title: "Pending Fees",
            value: formatCurrency(stats.pending),
            change: "-5.1%",
            period: "reduced",
            isPositive: false,
        },
        {
            title: "Collection Rate",
            value: `${stats.collectionRate}%`,
            change: "+2.3%",
            period: "improvement",
            isPositive: true,
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        Revenue Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Financial overview and fee collection analytics
                    </p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="flex items-center gap-1 text-xs">
                                {stat.isPositive ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                )}
                                <span className={stat.isPositive ? "text-green-500" : "text-red-500"}>
                                    {stat.change}
                                </span>
                                <span className="text-muted-foreground">{stat.period}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart Section */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Monthly Collection Trend - Area Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Monthly Collection Trend</CardTitle>
                        <CardDescription>Revenue overview over the past 9 months</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[350px] w-full">
                            {monthlyData.every(d => d.collected === 0 && d.pending === 0) ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>No fee data available yet</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                            tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--popover))',
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: 'var(--radius)',
                                                color: 'hsl(var(--popover-foreground))',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                            formatter={(value: number) => [`₹${(value).toLocaleString()}`, 'Collected']}
                                            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="collected"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorCollected)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Fee Collection by Class - Bar Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Fee Collection by Class</CardTitle>
                        <CardDescription>Performance breakdown by class level</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[350px] w-full">
                            {classData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>No class fee data available yet</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={classData}
                                        margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                                        barSize={20}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted/30" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="class"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            width={80}
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--popover))',
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: 'var(--radius)',
                                                color: 'hsl(var(--popover-foreground))',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                            formatter={(value: number) => [`${value}%`, 'Collection Rate']}
                                        />
                                        <Bar dataKey="collected" radius={[0, 4, 4, 0]} background={{ fill: 'hsl(var(--muted))' }}>
                                            {classData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
