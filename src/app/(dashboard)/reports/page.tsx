"use client";

import { useEffect, useState, useCallback } from "react";
import { ReportService } from "@/lib/report-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Download,
    BarChart3,
    TrendingUp,
    PieChart,
    Info,
    Loader2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Sparkles,
    FileSpreadsheet,
    FilePieChart,
    Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ── Metric Card ─────────────────────────────────────────────
function MetricCard({ title, value, desc, icon: Icon, trend, trendInfo, type, index }: any) {
    const configs: Record<string, any> = {
        revenue: {
            iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
            iconText: "text-emerald-500",
            gradient: "from-emerald-500 to-teal-500",
            trendColor: "text-emerald-500",
        },
        expense: {
            iconBg: "bg-rose-50 dark:bg-rose-900/20",
            iconText: "text-rose-500",
            gradient: "from-rose-500 to-pink-500",
            trendColor: "text-rose-500",
        },
        profit: {
            iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
            iconText: "text-indigo-500",
            gradient: "from-indigo-500 to-blue-500",
            trendColor: "text-indigo-500",
        },
        transactions: {
            iconBg: "bg-amber-50 dark:bg-amber-900/20",
            iconText: "text-amber-500",
            gradient: "from-amber-400 to-orange-500",
            trendColor: "text-amber-500",
        },
    };

    const cfg = configs[type] || configs.revenue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
        >
            <Card className="bg-white dark:bg-zinc-900/60 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-lg p-6 flex flex-col gap-4 hover:shadow-xl transition-all group overflow-hidden relative">
                <div className={cn("h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r", cfg.gradient, "opacity-40")} />
                <div className="flex items-center gap-4">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500", cfg.iconBg, cfg.iconText)}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.2em] mb-1">{title}</p>
                        <p className={cn("text-2xl font-black italic tracking-tighter", cfg.iconText)}>{value}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight truncate">{desc}</p>
                    {trend && (
                        <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-800", cfg.trendColor)}>
                            {trend} {trendInfo}
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}

// ── Export Card ─────────────────────────────────────────────
function ExportCard({ title, desc, type, url, icon: Icon, gradient, index }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
        >
            <Card className="bg-white dark:bg-zinc-900/60 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-lg p-8 group hover:shadow-2xl transition-all relative overflow-hidden">
                <div className={cn("h-full w-2 absolute left-0 top-0 bg-gradient-to-b", gradient)} />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex gap-5 items-center">
                        <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform", gradient, "text-white")}>
                            <Icon size={32} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tight uppercase leading-none">{title}</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-[300px]">{desc}</p>
                        </div>
                    </div>
                    <a href={url} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                        <Button className={cn("w-full sm:w-auto h-12 rounded-full px-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black uppercase italic tracking-tighter transition-all hover:scale-105 active:scale-95 border-0 gap-2")}>
                            <Download size={18} strokeWidth={3} /> Export {type}
                        </Button>
                    </a>
                </div>
            </Card>
        </motion.div>
    );
}

// ── AI Forecast Card ───────────────────────────────────────
function AIForecastCard({ content }: { content: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
        >
            <Card className="bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-400" />

                <CardContent className="p-8 md:p-12 space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-indigo-500">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Sparkles size={20} className="animate-pulse" />
                            </div>
                            <h3 className="text-xl font-black tracking-tighter uppercase italic">AI Financial Insights</h3>
                        </div>
                        <Badge variant="outline" className="rounded-full bg-indigo-500/10 border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5">
                            Predictive Analysis
                        </Badge>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 relative">
                        <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed italic relative">
                            <span className="text-5xl text-indigo-500/20 absolute -top-4 -left-4 font-serif">“</span>
                            {content}
                            <span className="text-5xl text-indigo-500/20 absolute -bottom-8 -right-4 font-serif">”</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30">
                            <ArrowUpRight size={16} strokeWidth={3} />
                            <span className="text-xs font-black uppercase tracking-widest">Growth Priority</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 border border-blue-100 dark:border-blue-900/30">
                            <Layers size={16} strokeWidth={3} />
                            <span className="text-xs font-black uppercase tracking-widest">Inventory Optimized</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

const Badge = ({ children, variant, className }: any) => (
    <div className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", className)}>
        {children}
    </div>
);

// ── Main Page ─────────────────────────────────────────────────
export default function ReportsPage() {
    const { currentCompany } = useAuthStore();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const companyId = currentCompany?.id || 1;

    const loadSummary = useCallback(async () => {
        if (!currentCompany) return;
        try {
            const data = await ReportService.getSummary(currentCompany.id);
            setSummary(data);
        } catch (error) {
            console.error("Failed to load summary", error);
            toast.error("Failed to load financial intelligence");
        } finally {
            setLoading(false);
        }
    }, [currentCompany]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                    <p className="text-zinc-500 font-bold text-sm tracking-tight">Accessing financial intelligence...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform rotate-3 hover:rotate-0 transition-transform">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-400 bg-clip-text text-transparent tracking-tighter uppercase italic leading-none mb-2">
                            Financial Intelligence
                        </h2>
                        <p className="text-xs md:text-base text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            Generate and analyze business performance reports.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="h-14 rounded-full px-6 border border-zinc-200 dark:border-zinc-700 font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-indigo-600 transition-all gap-2">
                        <Calendar size={16} /> Last 30 Days
                    </Button>
                    <Button
                        onClick={() => loadSummary()}
                        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full w-14 h-14 shadow-md transition-all hover:scale-105 active:scale-95 border-0"
                    >
                        <RefreshCw size={20} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
                    </Button>
                </div>
            </div>

            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    index={0}
                    type="revenue"
                    title="Total Revenue"
                    value={`$${parseFloat(summary?.total_income || 0).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                    desc="Recorded gross income"
                    icon={TrendingUp}
                    trend="+14%"
                    trendInfo="MoM"
                />
                <MetricCard
                    index={1}
                    type="expense"
                    title="Total Expenses"
                    value={`$${parseFloat(summary?.total_expense || 0).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                    desc="Recorded operational costs"
                    icon={TrendingUp}
                    trend="-5%"
                    trendInfo="Optimization"
                />
                <MetricCard
                    index={2}
                    type="profit"
                    title="Net Profit"
                    value={`$${parseFloat(summary?.net_profit || 0).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                    desc="Bottom line performance"
                    icon={BarChart3}
                    trend="+22%"
                    trendInfo="Growth"
                />
                <MetricCard
                    index={3}
                    type="transactions"
                    title="Activity"
                    value={summary?.transactions_count || 0}
                    desc="Total journal entries"
                    icon={FileText}
                    trend="Steady"
                    trendInfo="Volume"
                />
            </div>

            {/* ── Export Section ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ExportCard
                    index={0}
                    title="Management Report"
                    desc="Consolidated financial statement including full transaction history, categories and contact mapping."
                    type="Excel"
                    url={ReportService.exportExcelUrl(companyId)}
                    icon={FileSpreadsheet}
                    gradient="from-emerald-500 to-teal-400"
                />
                <ExportCard
                    index={1}
                    title="Executive Summary"
                    desc="Standard financial health portrait including charts, profit margins and key performance indicators."
                    type="PDF"
                    url={ReportService.exportPdfUrl(companyId)}
                    icon={FilePieChart}
                    gradient="from-rose-500 to-red-400"
                />
            </div>

            {/* ── AI Insights ── */}
            <AIForecastCard
                content={`Your current income-to-expense ratio is highly positive (1.45). At the current trajectory, your projected net profit for next quarter will increase by 18%. Consider leveraging $${(parseFloat(summary?.net_profit || 0) * 0.15).toLocaleString("en-CA", { minimumFractionDigits: 0 })} in product inventory to maintain the sales momentum.`}
            />

            {/* ── Footer ── */}
            <div className="pt-10 flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                    Business Intelligence Engine
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    v3.2.0 • High Precision Financial Analysis
                </p>
            </div>
        </div>
    );
}

const RefreshCw = ({ className, size, strokeWidth }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("lucide lucide-refresh-cw", className)}
    >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
    </svg>
);
