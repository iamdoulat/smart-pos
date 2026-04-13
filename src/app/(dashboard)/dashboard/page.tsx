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
    Area,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { useAuthStore } from "@/lib/store";
import { ReportService } from "@/lib/report-service";
import { SaleService, Sale } from "@/lib/sales-purchase-service";
import { Loader2, MoreVertical, Calendar, User, ShoppingBag } from "lucide-react";
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

const CHART_COLORS = ["#0c4a6e", "#0ea5e9", "#10b981", "#6366f1", "#f59e0b"];

function getInitials(name: string) {
    if (!name) return "??";
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

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

    const totalTopProductsValue = (summary?.top_products || []).reduce((acc: number, p: any) => acc + parseFloat(p.total_value), 0);

    return (
        <div className="space-y-6">
            {/* Main Upper Row */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Financial Performance - Wide Left */}
                <Card className="lg:col-span-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold text-zinc-800 dark:text-zinc-100 italic">Financial Performance</CardTitle>
                            <p className="text-xs text-zinc-500 font-medium">Monthly growth & revenue analysis</p>
                        </div>
                        <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-1.5 hover:bg-zinc-100 transition-all uppercase tracking-tight">
                            Last 6 Months
                            <MoreVertical size={10} className="rotate-90" />
                        </button>
                    </CardHeader>
                    <CardContent className="h-[300px] px-2 pb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary?.chart_data || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#94a3b8" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                />
                                <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="expense" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Cash Flow Analytics - Navy Hero */}
                <Card className="lg:col-span-3 border-0 bg-[#052c4c] shadow-lg rounded-xl overflow-hidden relative">
                    <CardHeader className="pb-0 pt-6 px-6">
                        <CardTitle className="text-xl font-bold text-white italic">Cash Flow Analytics</CardTitle>
                        <p className="text-xs text-white/50 font-medium">Expert-grade liquidity monitoring</p>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-10 flex flex-col h-[300px]">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-black text-white italic tracking-tighter">
                                ${parseFloat(summary?.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs font-bold text-emerald-400">+2.4% vs last period</span>
                        </div>
                        
                        {/* Sparkline chart at the bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 w-full overflow-hidden opacity-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={summary?.chart_data || []}>
                                    <defs>
                                        <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area 
                                        type="monotone" 
                                        dataKey="income" 
                                        stroke="#0ea5e9" 
                                        strokeWidth={3}
                                        fill="url(#cashGradient)" 
                                        activeDot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Sales History */}
                <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                        <CardTitle className="text-lg font-black text-zinc-900 dark:text-zinc-100 italic tracking-tight uppercase">Recent Sales History</CardTitle>
                        <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 uppercase tracking-widest transition-all">
                            View All
                            <ArrowUpRight size={14} className="mb-0.5" />
                        </button>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                                <TableRow className="hover:bg-transparent border-t border-zinc-100 dark:border-zinc-800">
                                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-400 pl-6 h-10">Info</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-400 h-10">Customer</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-400 h-10 text-right">Amount (CAD)</TableHead>
                                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-zinc-400 h-10 text-center pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.map((sale) => (
                                    <TableRow key={sale.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 h-16 group transition-colors">
                                        <TableCell className="pl-6">
                                            <span className="font-black text-xs text-indigo-500 italic uppercase">
                                                #TXN-{sale.sales_code.split('-').pop()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                                    {getInitials(sale.customer?.name || "Walk-in")}
                                                </div>
                                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                    {sale.customer?.name || "Walk-in Customer"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-xs font-black text-zinc-800 dark:text-zinc-100">
                                                ${parseFloat(sale.grand_total.toString()).toFixed(2)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center pr-6">
                                            <div className="flex justify-center">
                                                <PaymentStatusBadge status={sale.payment_status} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="lg:col-span-1 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden flex flex-col">
                    <CardHeader className="pb-2 pt-6 px-6">
                        <CardTitle className="text-lg font-black text-zinc-900 dark:text-zinc-100 italic tracking-tight uppercase">Top Products</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col px-6 pb-6">
                        {/* Donut Chart with Center Label */}
                        <div className="relative h-[220px] w-full flex items-center justify-center mb-6 mt-2">
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-1">
                                <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter italic">
                                    ${totalTopProductsValue >= 1000 ? `${(totalTopProductsValue / 1000).toFixed(1)}k` : totalTopProductsValue.toFixed(0)}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Total Sales</span>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={(summary?.top_products || []).map((p: any) => ({
                                            ...p,
                                            total_value: parseFloat(p.total_value || "0")
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="total_value"
                                        nameKey="name"
                                        stroke="none"
                                    >
                                        {(summary?.top_products || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Custom Legend */}
                        <div className="space-y-3">
                            {(summary?.top_products || []).map((product: any, index: number) => {
                                const percentage = totalTopProductsValue > 0 
                                    ? Math.round((parseFloat(product.total_value) / totalTopProductsValue) * 100) 
                                    : 0;
                                return (
                                    <div key={product.name} className="flex items-center justify-between text-xs transition-opacity hover:opacity-80 cursor-default">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                            <span className="font-bold text-zinc-500 dark:text-zinc-400 truncate max-w-[120px]">{product.name}</span>
                                        </div>
                                        <span className="font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded italic">{percentage}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function PaymentStatusBadge({ status }: { status?: string }) {
    const s = status?.toLowerCase() || "unpaid";
    
    if (s === "paid") {
        return (
            <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                <span className="text-[10px] font-black text-emerald-600 uppercase italic">Paid</span>
            </div>
        );
    }
    
    if (s === "partial") {
        return (
            <div className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                <span className="text-[10px] font-black text-indigo-500 uppercase italic">Partial</span>
            </div>
        );
    }

    return (
        <div className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800">
            <span className="text-[10px] font-black text-rose-500 uppercase italic">Unpaid</span>
        </div>
    );
}

function StatCard({ title, value, change, trend, icon: Icon, gradient }: any) {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl p-5 bg-gradient-to-br shadow-sm transition-all duration-200 hover:scale-[1.01] cursor-default",
            gradient
        )}>
            <div className="absolute inset-0 bg-white/5 rounded-xl" />
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2 italic">
                        {title}
                    </p>
                    <p className="text-2xl font-black text-white leading-none mb-3 italic tracking-tighter">
                        {value}
                    </p>
                    <p className="flex items-center gap-1 text-[10px] text-white/80 font-bold uppercase">
                        {trend === "up"
                            ? <ArrowUpRight className="h-3 w-3 text-white/90" />
                            : <ArrowDownRight className="h-3 w-3 text-white/70" />
                        }
                        {change}
                    </p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-white" />
                </div>
            </div>
        </div>
    );
}
