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
import { SaleService, Sale } from "@/lib/sales-purchase-service";
import { Loader2, MoreVertical, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardPage() {
    const { currentCompany } = useAuthStore();
    const [summary, setSummary] = useState<any>(null);
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!currentCompany) {
                setLoading(false);
                return;
            }
            try {
                const [summaryData, salesData] = await Promise.all([
                    ReportService.getSummary(currentCompany.id),
                    SaleService.getAll(currentCompany.id)
                ]);
                setSummary(summaryData);
                // Get latest 5 sales for dashboard
                setSales(Array.isArray(salesData) ? salesData.slice(0, 5) : []);
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 ">
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

            {/* Sales History Table */}
            <div className="relative p-[1px] rounded-[22px] overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl">
                <div className="rounded-[21px] bg-white dark:bg-zinc-950 p-1">
                    <Card className="border-0 bg-transparent shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 pt-4 px-6 leading-none">
                            <div className="space-y-1.5">
                                <CardTitle className="text-xl font-bold italic tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
                                    Recent Sales History
                                </CardTitle>
                                <p className="text-sm text-zinc-500 font-medium">Monitoring your latest transactions across all channels</p>
                            </div>
                            <Badge variant="outline" className="h-7 px-3 bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 font-semibold gap-1.5 transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-default">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                LIVE UPDATES
                            </Badge>
                        </CardHeader>
                        <CardContent className="px-2">
                            <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-black/20">
                                <Table>
                                    <TableHeader className="bg-zinc-100/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 h-11 pl-6">Sale Info</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 h-11">Customer</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 h-11">Date</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 h-11">Method</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 h-11 text-right">Amount</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 h-11 text-center">Status</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 h-11 pr-6 text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sales.length > 0 ? sales.map((sale) => (
                                            <TableRow key={sale.id} className="border-b border-zinc-100 dark:border-zinc-900 group hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 transition-colors">
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{sale.sales_code}</span>
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">REF: POS</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-800 group-hover:ring-indigo-500/20 transition-all">
                                                            <User size={14} />
                                                        </div>
                                                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                                            {sale.customer?.name || "Walk-in Customer"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                                        <Calendar size={13} strokeWidth={2.5} />
                                                        <span className="text-xs font-medium">
                                                            {new Date(sale.sales_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <Badge variant="outline" className="bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold py-0.5 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                        {sale.payment_type?.toUpperCase() || "CASH"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-4 text-right">
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 italic">
                                                            CAD {parseFloat(sale.grand_total.toString()).toFixed(2)}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase">
                                                            PAID: {parseFloat((sale.paid_amount || 0).toString()).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-center">
                                                    <div className="flex justify-center">
                                                        <PaymentStatusBadge status={sale.payment_status} />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="pr-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 transition-colors">
                                                                <MoreVertical size={16} />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 dark:bg-zinc-950 dark:border-zinc-800">
                                                            <DropdownMenuItem className="text-xs font-semibold dark:hover:bg-zinc-900 cursor-pointer italic text-zinc-500 dark:text-zinc-400">View Details</DropdownMenuItem>
                                                            <DropdownMenuItem className="text-xs font-semibold dark:hover:bg-zinc-900 cursor-pointer italic text-zinc-500 dark:text-zinc-400">Download Invoice</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center text-zinc-500 font-medium">
                                                    No recent sales found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="py-4 px-6 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                    Showing {sales.length} of {summary?.transactions_count || sales.length} records
                                </p>
                                <div className="flex items-center gap-2">
                                    <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all uppercase tracking-tighter">Prev</button>
                                    <div className="h-6 w-6 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">1</div>
                                    <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all uppercase tracking-tighter">Next</button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function PaymentStatusBadge({ status }: { status?: string }) {
    const s = status?.toLowerCase() || "unpaid";
    
    if (s === "paid") {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-500/20">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-extrabold text-emerald-500 uppercase italic">Paid</span>
            </div>
        );
    }
    
    if (s === "partial") {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-400/10 border border-orange-500/20">
                <div className="h-1 w-1 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                <span className="text-[10px] font-extrabold text-orange-500 uppercase italic">Partial</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-400/10 border border-rose-500/20">
            <div className="h-1 w-1 rounded-full bg-rose-500" />
            <span className="text-[10px] font-extrabold text-rose-500 uppercase italic">Unpaid</span>
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
