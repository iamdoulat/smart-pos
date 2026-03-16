"use client";

import { useEffect, useState } from "react";
import { CreditCard, DollarSign, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { useAuthStore } from "@/lib/store";
import { ReportService } from "@/lib/report-service";
import { Loader2 } from "lucide-react";


export default function DashboardPage() {
    const { currentCompany } = useAuthStore();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!currentCompany) {
                setLoading(false);
                return;
            }
            try {
                const data = await ReportService.getSummary(currentCompany.id);
                setSummary(data);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [currentCompany]);

    if (loading && currentCompany) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Revenue"
                    value={`$${parseFloat(summary?.total_income || 0).toFixed(2)}`}
                    change="+12.5% vs last month"
                    trend="up"
                    icon={DollarSign}
                    gradient="from-blue-500 via-blue-600 to-indigo-700"
                />
                <StatCard
                    title="Expenses"
                    value={`$${parseFloat(summary?.total_expense || 0).toFixed(2)}`}
                    change="+4.2% vs last month"
                    trend="up"
                    icon={CreditCard}
                    gradient="from-emerald-400 via-teal-500 to-cyan-600"
                />
                <StatCard
                    title="Net Profit"
                    value={`$${parseFloat(summary?.net_profit || 0).toFixed(2)}`}
                    change="+18.3% vs last month"
                    trend="up"
                    icon={TrendingUp}
                    gradient="from-violet-500 via-purple-600 to-indigo-600"
                />
                <StatCard
                    title="Transactions"
                    value={summary?.transactions_count || 0}
                    change="Steady this month"
                    trend="up"
                    icon={AlertCircle}
                    gradient="from-orange-400 via-orange-500 to-rose-500"
                />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-xl hover:border-indigo-500/20 transition-all">
                    <CardHeader>
                        <CardTitle className="text-zinc-900 dark:text-zinc-100 italic">Financial Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary?.chart_data || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px" }}
                                    itemStyle={{ color: "var(--foreground)" }}
                                />
                                <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-xl hover:border-indigo-500/20 transition-all">
                    <CardHeader>
                        <CardTitle className="text-zinc-900 dark:text-zinc-100 italic">Cash Flow Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={summary?.chart_data || []}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px" }}
                                    itemStyle={{ color: "var(--foreground)" }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#6366f1" fillOpacity={1} fill="url(#colorIncome)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, trend, icon: Icon, gradient }: any) {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl cursor-default",
            gradient
        )}>
            {/* Subtle radial glow overlay */}
            <div className="absolute inset-0 bg-white/5 rounded-2xl" />

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">
                        {title}
                    </p>
                    <p className="text-3xl font-extrabold text-white leading-none mb-3">
                        {value}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-white/80 font-medium">
                        {trend === "up"
                            ? <ArrowUpRight className="h-3.5 w-3.5 text-white/90" />
                            : <ArrowDownRight className="h-3.5 w-3.5 text-white/70" />
                        }
                        {change}
                    </p>
                </div>

                {/* Icon box */}
                <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-white" />
                </div>
            </div>
        </div>
    );
}
