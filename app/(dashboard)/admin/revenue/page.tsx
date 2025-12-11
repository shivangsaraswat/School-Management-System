import { BarChart3, TrendingUp, IndianRupee, Download } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function RevenuePage() {
    await requireAdmin();

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
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Collection Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {monthlyData.map((data) => (
                                <div key={data.month} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{data.month}</span>
                                        <span className="text-muted-foreground">
                                            ₹{(data.collected / 100000).toFixed(1)}L
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all"
                                            style={{
                                                width: `${(data.collected / 750000) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Fee Collection by Class</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { class: "Class 10", collected: 85, amount: "₹8.2L" },
                                { class: "Class 9", collected: 92, amount: "₹7.8L" },
                                { class: "Class 8", collected: 78, amount: "₹6.5L" },
                                { class: "Class 7", collected: 95, amount: "₹5.9L" },
                                { class: "Class 6", collected: 88, amount: "₹5.4L" },
                                { class: "Class 5", collected: 90, amount: "₹4.8L" },
                            ].map((item) => (
                                <div key={item.class} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{item.class}</span>
                                        <span className="text-muted-foreground">
                                            {item.collected}% • {item.amount}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${item.collected >= 90
                                                ? "bg-green-500"
                                                : item.collected >= 80
                                                    ? "bg-yellow-500"
                                                    : "bg-orange-500"
                                                }`}
                                            style={{ width: `${item.collected}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
