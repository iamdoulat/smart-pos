"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useTranslation } from "@/i18n/TranslationContext";
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
    const { t } = useTranslation();
    const router = useRouter();
    const { user, currentCompany } = useAuthStore();
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const getGreeting = () => {
            const timezone = currentCompany?.timezone || 'UTC';
            const hour = parseInt(new Intl.DateTimeFormat('en-US', { 
                timeZone: timezone, 
                hour: 'numeric', 
                hour12: false 
            }).format(new Date()));

            if (hour >= 5 && hour < 12) return t("dashboard.good_morning");
            if (hour >= 12 && hour < 17) return t("dashboard.good_afternoon");
            if (hour >= 17 && hour < 21) return t("dashboard.good_evening");
            return t("dashboard.good_night");
        };

        setGreeting(getGreeting());
    }, [currentCompany, t]);
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
        <div className="w-full p-4 md:p-6 space-y-6">
            {/* Greeting Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {greeting}, <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">{user?.name || "User"}</span>!
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {t("dashboard.welcome_back_desc")}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 shadow-sm">
                    <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                        <Calendar size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{t("common.today")}</span>
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date())}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title={t("dashboard.total_revenue")}
                    value={`$${parseFloat(summary?.total_income || 0).toFixed(2)}`}
                    change={`+12.5% ${t('dashboard.vs_last_month')}`}
                    trend="up"
                    icon={DollarSign}
                    gradient="from-blue-500 via-blue-600 to-indigo-700"
                />
                <StatCard
                    title={t("dashboard.total_expense")}
                    value={`$${parseFloat(summary?.total_expense || 0).toFixed(2)}`}
                    change={`+4.2% ${t('dashboard.vs_last_month')}`}
                    trend="up"
                    icon={CreditCard}
                    gradient="from-emerald-400 via-teal-500 to-cyan-600"
                />
                <StatCard
                    title={t("dashboard.net_profit")}
                    value={`$${parseFloat(summary?.net_profit || 0).toFixed(2)}`}
                    change={`+18.3% ${t('dashboard.vs_last_month')}`}
                    trend="up"
                    icon={TrendingUp}
                    gradient="from-violet-500 via-purple-600 to-indigo-600"
                />
                <StatCard
                    title={t("dashboard.all_transactions")}
                    value={summary?.transactions_count || 0}
                    change={t('dashboard.steady_this_month')}
                    trend="up"
                    icon={AlertCircle}
                    gradient="from-orange-400 via-orange-500 to-rose-500"
                />
            </div>

            {/* Main Upper Row */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Financial Performance - Wide Left */}
                <Card className="lg:col-span-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl rounded-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t("dashboard.sales_overview")}</CardTitle>
                            <p className="text-xs text-zinc-500 font-medium">{t("dashboard.quick_stats")}</p>
                        </div>
                        <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-1.5 hover:bg-zinc-100 transition-all uppercase tracking-tight">
                            {t("dashboard.last_6_months")}
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
                <Card className="lg:col-span-3 border-0 bg-[#052c4c] shadow-xl rounded-xl overflow-hidden relative">
                    <CardHeader className="pb-0 pt-6 px-6">
                        <CardTitle className="text-lg font-semibold text-white">{t("dashboard.cash_flow_analytics")}</CardTitle>
                        <p className="text-xs text-white/50 font-medium">{t("dashboard.expert_monitoring")}</p>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-10 flex flex-col h-[300px]">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-bold text-white tracking-tight">
                                ${parseFloat(summary?.net_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs font-bold text-emerald-400">+2.4% {t("dashboard.vs_last_period")}</span>
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
                <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl rounded-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                        <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">{t("dashboard.recent_sales")}</CardTitle>
                        <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 uppercase tracking-widest transition-all" onClick={() => router.push('/sales')}>
                            {t("common.view")}
                            <ArrowUpRight size={14} className="mb-0.5" />
                        </button>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                                <TableRow className="hover:bg-transparent border-t border-zinc-100 dark:border-zinc-800">
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-black dark:text-white pl-6 h-10">{t("common.details")}</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-black dark:text-white h-10">{t("common.customer")}</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-black dark:text-white h-10 text-right">{t("common.amount")}</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-black dark:text-white h-10 text-center pr-6">{t("common.status")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.map((sale) => (
                                    <TableRow key={sale.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 h-16 group transition-colors">
                                        <TableCell className="pl-6">
                                            <span className="font-bold text-[10px] text-indigo-500 uppercase">
                                                #TXN-{sale.sales_code.split('-').pop()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                                    {getInitials(sale.customer?.name || "Walk-in")}
                                                </div>
                                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                    {sale.customer?.name || t('sales.walk_in_customer') || "Walk-in Customer"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                                                ${parseFloat(sale.grand_total.toString()).toFixed(2)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center pr-6">
                                            <div className="flex justify-center">
                                                <PaymentStatusBadge status={sale.payment_status || "Unpaid"} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="lg:col-span-1 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl rounded-xl overflow-hidden flex flex-col">
                    <CardHeader className="pb-2 pt-6 px-6">
                        <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">{t("dashboard.top_products")}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col px-6 pb-6">
                        {/* Donut Chart with Center Label */}
                        <div className="relative h-[220px] w-full flex items-center justify-center mb-6 mt-2">
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-1">
                                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                    ${totalTopProductsValue >= 1000 ? `${(totalTopProductsValue / 1000).toFixed(1)}k` : totalTopProductsValue.toFixed(0)}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{t("dashboard.total_sales")}</span>
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

                        {/* List of Products with mini bars */}
                        <div className="space-y-4">
                            {(summary?.top_products || []).slice(0, 4).map((product: any, index: number) => (
                                <div key={index} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                            <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">{product.name}</span>
                                        </div>
                                        <span className="text-zinc-400 italic font-medium">{product.total_qty} {t("dashboard.sold")}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000" 
                                            style={{ 
                                                width: `${(parseFloat(product.total_value) / (totalTopProductsValue || 1) * 100)}%`,
                                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                                            }}
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

function StatCard({ title, value, change, trend, icon: Icon, gradient }: any) {
    return (
        <Card className={cn("border-0 shadow-xl rounded-3xl overflow-hidden text-white relative group h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br", gradient)}>
            <CardContent className="p-7 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[11px] font-black uppercase tracking-[0.15em] opacity-80">{title}</p>
                        <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
                        <Icon size={24} strokeWidth={2.5} className="text-white" />
                    </div>
                </div>
                
                <div className="mt-8 flex items-center gap-1.5">
                    {trend === "up" ? (
                        <ArrowUpRight size={14} className="text-white" />
                    ) : (
                        <ArrowDownRight size={14} className="text-white" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-90">
                        {change}
                    </span>
                </div>
            </CardContent>
            
            {/* Decorative background element */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-700"></div>
        </Card>
    );
}

function PaymentStatusBadge({ status }: { status: string }) {
    const { t } = useTranslation();
    const isPaid = status === "Paid";
    const isPartial = status === "Partial";

    return (
        <Badge 
            variant="outline" 
            className={cn(
                "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg border-0 shadow-sm",
                isPaid ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20" : 
                isPartial ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20" : 
                "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20"
            )}
        >
            {isPaid ? t('common.paid') : isPartial ? t('common.partial') : t('common.due')}
        </Badge>
    );
}
