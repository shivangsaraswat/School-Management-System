"use client";

import { BarChart3, TrendingUp, IndianRupee, Download } from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RevenueDashboardClient() {

    const stats = [
        {
            title: "Total Revenue",
            value: "₹45,82,000",
            change: "+12.5%",
            period: "this year",
        },
        {
            title: "This Month",
            value: "₹6,24,000",
            change: "+8.2%",
            period: "vs last month",
        },
        {
            title: "Pending Fees",
            value: "₹4,80,000",
            change: "-5.1%",
            period: "reduced",
        },
        {
            title: "Collection Rate",
            value: "91.2%",
            change: "+2.3%",
            period: "improvement",
        },
    ];

    const monthlyData = [
        { month: "Apr", collected: 520000, pending: 80000 },
        { month: "May", collected: 580000, pending: 70000 },
        { month: "Jun", collected: 540000, pending: 85000 },
        { month: "Jul", collected: 620000, pending: 65000 },
        { month: "Aug", collected: 650000, pending: 55000 },
        { month: "Sep", collected: 680000, pending: 50000 },
        { month: "Oct", collected: 720000, pending: 45000 },
        { month: "Nov", collected: 690000, pending: 48000 },
        { month: "Dec", collected: 624000, pending: 42000 },
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
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="flex items-center gap-1 text-xs">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-green-500">{stat.change}</span>
                                <span className="text-muted-foreground">{stat.period}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart Section */}
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
                                        formatter={(value: any) => [`₹${(value).toLocaleString()}`, 'Collected']}
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
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    layout="vertical"
                                    data={[
                                        { class: "Class 10", collected: 85, fill: "#3b82f6" }, // blue
                                        { class: "Class 9", collected: 92, fill: "#22c55e" },  // green
                                        { class: "Class 8", collected: 78, fill: "#ea580c" },  // orange
                                        { class: "Class 7", collected: 95, fill: "#8b5cf6" },  // violet
                                        { class: "Class 6", collected: 88, fill: "#eab308" },  // yellow
                                        { class: "Class 5", collected: 90, fill: "#ef4444" },  // red
                                    ]}
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
                                        formatter={(value: any) => [`${value}%`, 'Collection Rate']}
                                    />
                                    <Bar dataKey="collected" radius={[0, 4, 4, 0]} background={{ fill: 'hsl(var(--muted))', radius: [0, 4, 4, 0] }}>
                                        {[
                                            { class: "Class 10", collected: 85, fill: "#3b82f6" },
                                            { class: "Class 9", collected: 92, fill: "#22c55e" },
                                            { class: "Class 8", collected: 78, fill: "#ea580c" },
                                            { class: "Class 7", collected: 95, fill: "#8b5cf6" },
                                            { class: "Class 6", collected: 88, fill: "#eab308" },
                                            { class: "Class 5", collected: 90, fill: "#ef4444" },
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
