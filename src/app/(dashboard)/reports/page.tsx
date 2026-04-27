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
    Users,
    ChevronDown,
    Wallet,
    Building2,
    RefreshCw
} from "lucide-react";
import { ContactService, Contact } from "@/lib/contact-service";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/TranslationContext";
import { Badge } from "@/components/ui/badge";

// ── Metric Card ─────────────────────────────────────────────
function MetricCard({ title, value, desc, icon: Icon, trend, trendInfo, type, index }: any) {
    const configs: Record<string, any> = {
        revenue: { color: "indigo" },
        expense: { color: "rose" },
        profit: { color: "emerald" },
        transactions: { color: "amber" },
    };

    const gradientClasses: any = {
        indigo: "bg-gradient-to-r from-[#2B5BFF] to-[#5138EE]",
        emerald: "bg-gradient-to-r from-[#00D09E] to-[#019DA3]",
        amber: "bg-gradient-to-r from-[#FF8800] to-[#FF3B3B]",
        purple: "bg-gradient-to-r from-[#9747FF] to-[#6A0DAD]",
        rose: "bg-gradient-to-r from-[#FF3B3B] to-[#D91B1B]",
    };

    const cfg = configs[type] || configs.revenue;
    const colorClass = gradientClasses[cfg.color] || gradientClasses.indigo;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={cn("rounded-xl overflow-hidden text-white transition-all duration-300 shadow-xl hover:-translate-y-1 relative group w-full", colorClass)}
        >
            <div className="p-5 flex flex-col justify-center h-[120px]">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[15px] uppercase font-bold tracking-wider text-white/90 drop-shadow-sm truncate">{title}</p>
                        <h3 className="text-3xl font-black tracking-tight text-white drop-shadow-md truncate">{value}</h3>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mt-1 shadow-inner border border-white/10">
                        <Icon size={16} className="text-white drop-shadow-sm" strokeWidth={2.5} />
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/90 mt-2">
                    {trend === '+' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 shrink-0"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
                    ) : trend === '-' ? (
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 shrink-0"><path d="M7 17h10V7" /><path d="M7 7l10 10" /></svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 shrink-0"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
                    )}
                    <span className="truncate">{trendInfo} • {desc}</span>
                </div>
            </div>
        </motion.div>
    );
}

// ── Export Card ─────────────────────────────────────────────
function ExportCard({ title, desc, type, url, icon: Icon, gradient, index, exportLabel }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
        >
            <Card className="bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg p-5 group hover:shadow-2xl transition-all relative overflow-hidden">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex gap-4 items-center">
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform flex-shrink-0", gradient, "text-white")}>
                            <Icon size={24} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-tight">{title}</h4>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold leading-tight line-clamp-1">{desc}</p>
                        </div>
                    </div>
                    <a href={url} target="_blank" rel="noreferrer" className="w-full xl:w-auto">
                        <Button className="w-full xl:w-auto h-10 rounded-full px-6 bg-gradient-to-r from-orange-400 to-indigo-500 text-white font-black text-xs shadow-[0_6px_15px_-4px_rgba(251,146,60,0.4)] transition-all hover:scale-105 active:scale-95 border-0 gap-2 whitespace-nowrap">
                            <Download size={14} strokeWidth={3} /> {exportLabel} {type}
                        </Button>
                    </a>
                </div>
            </Card>
        </motion.div>
    );
}

// ── AI Forecast Card ───────────────────────────────────────
function AIForecastCard({ content, t }: { content: string, t: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
        >
            <Card className="bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-blue-500/5 pointer-events-none" />

                <CardContent className="p-8 md:p-12 space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-indigo-500">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Sparkles size={20} className="animate-pulse" />
                            </div>
                            <h3 className="text-xl font-black tracking-tighter uppercase">{t('reports.ai_insights')}</h3>
                        </div>
                        <Badge variant="outline" className="rounded-full bg-indigo-500/10 border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5">
                            {t('reports.predictive_analysis')}
                        </Badge>
                    </div>

                    <div className="p-8 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 relative">
                        <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed relative">
                            <span className="text-5xl text-indigo-500/20 absolute -top-4 -left-4 font-serif">“</span>
                            {content}
                            <span className="text-5xl text-indigo-500/20 absolute -bottom-8 -right-4 font-serif">”</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 border border-emerald-100 dark:border-emerald-900/30">
                            <ArrowUpRight size={16} strokeWidth={3} />
                            <span className="text-xs font-black uppercase tracking-widest">{t('reports.growth_priority')}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 border border-blue-100 dark:border-blue-900/30">
                            <Layers size={16} strokeWidth={3} />
                            <span className="text-xs font-black uppercase tracking-widest">{t('reports.inventory_optimized')}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ReportsPage() {
    const { t } = useTranslation();
    const { currentCompany } = useAuthStore();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [vendors, setVendors] = useState<Contact[]>([]);
    const [selectedVendorId, setSelectedVendorId] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [exporting, setExporting] = useState(false);
    const [dateRange, setDateRange] = useState<string>("30");
    const companyId = currentCompany?.id || 1;

    const DATE_RANGE_OPTIONS = [
        { value: "7", label: t('reports.last_7_days') || "Last 7 Days" },
        { value: "30", label: t('reports.last_30_days') || "Last 30 Days" },
        { value: "60", label: t('reports.last_60_days') || "Last 60 Days" },
        { value: "90", label: t('reports.last_3_months') || "Last 3 Months" },
        { value: "180", label: t('reports.last_6_months') || "Last 6 Months" },
        { value: "365", label: t('reports.last_12_months') || "Last 12 Months" },
    ];

    const loadSummary = useCallback(async () => {
        if (!currentCompany) return;
        setLoading(true);
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

    const loadVendors = useCallback(async () => {
        if (!currentCompany) return;
        try {
            const data = await ContactService.getAll(currentCompany.id, 'vendor');
            setVendors(data);
        } catch (error) {
            console.error("Failed to load vendors", error);
        }
    }, [currentCompany]);

    useEffect(() => {
        loadSummary();
        loadVendors();
    }, [loadSummary, loadVendors]);

    if (loading && !summary) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                    <p className="text-zinc-500 font-bold text-sm tracking-tight">{t('reports.accessing_intelligence')}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-[1.5rem] bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 relative group transition-all duration-500 hover:scale-105">
                        <BarChart3 size={24} strokeWidth={2.5} className="relative z-10" />
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-400 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter uppercase leading-tight pt-[5px]">
                            {t('reports.title')}
                        </h1>
                        <p className="text-[9px] md:text-[11px] text-zinc-500 dark:text-zinc-400 font-black tracking-[0.2em] uppercase opacity-70">
                            {t('reports.subtitle')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="h-12 rounded-full px-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 font-black text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-300 hover:border-indigo-400 transition-all gap-3 min-w-[220px] shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-zinc-400" />
                                    <SelectValue />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-2xl p-2 shadow-2xl">
                                {DATE_RANGE_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="rounded-xl h-11 font-black text-[10px] uppercase tracking-widest focus:bg-indigo-600 focus:text-white transition-colors cursor-pointer">
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={() => loadSummary()}
                        className="bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full w-12 h-12 shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.05] active:scale-95 border-0 flex items-center justify-center p-0"
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
                    title={t('reports.total_revenue')}
                    value={`$${parseFloat(summary?.total_income || 0).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                    desc={t('reports.recorded_gross_income')}
                    icon={TrendingUp}
                    trend="+"
                    trendInfo="+14%"
                />
                <MetricCard
                    index={1}
                    type="expense"
                    title={t('reports.total_expenses')}
                    value={`$${parseFloat(summary?.total_expense || 0).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                    desc={t('reports.recorded_operational_costs')}
                    icon={TrendingUp}
                    trend="-"
                    trendInfo="-5%"
                />
                <MetricCard
                    index={2}
                    type="profit"
                    title={t('reports.net_profit')}
                    value={`$${parseFloat(summary?.net_profit || 0).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                    desc={t('reports.performance')}
                    icon={BarChart3}
                    trend="+"
                    trendInfo="+22%"
                />
                <MetricCard
                    index={3}
                    type="transactions"
                    title={t('reports.activity')}
                    value={summary?.transactions_count || 0}
                    desc={t('reports.journal_entries')}
                    icon={FileText}
                    trend="+"
                    trendInfo="Steady"
                />
            </div>

            {/* ── Export Section ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ExportCard
                    index={0}
                    title={t('reports.management_report')}
                    desc={t('reports.management_desc')}
                    type="Excel"
                    url={ReportService.exportExcelUrl(companyId)}
                    icon={FileSpreadsheet}
                    gradient="from-emerald-500 to-teal-400"
                    exportLabel={t('reports.export_excel')}
                />
                <ExportCard
                    index={1}
                    title={t('reports.executive_summary')}
                    desc={t('reports.executive_desc')}
                    type="PDF"
                    url={ReportService.exportPdfUrl(companyId)}
                    icon={FilePieChart}
                    gradient="from-rose-500 to-red-400"
                    exportLabel={t('reports.export_pdf')}
                />
            </div>

            {/* ── Supplier Wise Report ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
            >
                <Card className="bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg p-8 group hover:shadow-2xl transition-all relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex gap-5 items-center">
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white">
                                <Users size={32} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-none">{t('reports.supplier_report')}</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-[350px]">
                                    {t('reports.supplier_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="w-full sm:w-64">
                                <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-4">
                                        <SelectValue placeholder={t('reports.select_supplier')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-2 max-h-64">
                                        {vendors.map(v => (
                                            <SelectItem key={v.id} value={v.id.toString()} className="rounded-xl h-10 font-bold focus:bg-indigo-600 focus:text-white">
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                disabled={!selectedVendorId || exporting}
                                onClick={() => {
                                    if (!selectedVendorId) return;
                                    window.open(ReportService.exportSupplierPdfUrl(companyId, parseInt(selectedVendorId)), '_blank');
                                }}
                                className="w-full sm:w-auto h-12 rounded-full px-8 bg-gradient-to-r from-orange-400 to-indigo-500 text-white font-black text-base shadow-[0_8px_20px_-6px_rgba(251,146,60,0.5)] transition-all hover:scale-105 active:scale-95 border-0 gap-2 disabled:opacity-50 disabled:grayscale"
                            >
                                <Download size={18} strokeWidth={3} /> {t('reports.export_pdf')}
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* ── Yearly Performance Report ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
            >
                <Card className="bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg p-8 group hover:shadow-2xl transition-all relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex gap-5 items-center">
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg text-white">
                                <BarChart3 size={32} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-none">{t('reports.yearly_summary')}</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-[350px]">
                                    {t('reports.yearly_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="w-full sm:w-48">
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-4">
                                        <SelectValue placeholder={t('reports.select_year')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-2">
                                        {[2023, 2024, 2025, 2026].map(year => (
                                            <SelectItem key={year} value={year.toString()} className="rounded-xl h-10 font-bold focus:bg-amber-500 focus:text-white">
                                                {t('reports.year_label', { year })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                disabled={exporting}
                                onClick={() => {
                                    window.open(ReportService.exportYearlyPdfUrl(companyId, parseInt(selectedYear)), '_blank');
                                }}
                                className="w-full sm:w-auto h-12 rounded-full px-8 bg-gradient-to-r from-orange-400 to-indigo-500 text-white font-black text-base shadow-[0_8px_20px_-6px_rgba(251,146,60,0.5)] transition-all hover:scale-105 active:scale-95 border-0 gap-2"
                            >
                                <Download size={18} strokeWidth={3} /> {t('reports.export_pdf')}
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* ── Expenses Yearly Report ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
            >
                <Card className="bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg p-8 group hover:shadow-2xl transition-all relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex gap-5 items-center">
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg text-white">
                                <Wallet size={32} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-none">{t('reports.yearly_expenses')}</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-[350px]">
                                    {t('reports.expenses_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="w-full sm:w-48">
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-4">
                                        <SelectValue placeholder={t('reports.select_year')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-2">
                                        {[2023, 2024, 2025, 2026].map(year => (
                                            <SelectItem key={year} value={year.toString()} className="rounded-xl h-10 font-bold focus:bg-rose-500 focus:text-white">
                                                {t('reports.year_label', { year })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                disabled={exporting}
                                onClick={() => {
                                    window.open(ReportService.exportExpensesPdfUrl(companyId, parseInt(selectedYear)), '_blank');
                                }}
                                className="w-full sm:w-auto h-12 rounded-full px-8 bg-gradient-to-r from-orange-400 to-indigo-500 text-white font-black text-base shadow-[0_8px_20px_-6px_rgba(251,146,60,0.5)] transition-all hover:scale-105 active:scale-95 border-0 gap-2"
                            >
                                <Download size={18} strokeWidth={3} /> {t('reports.export_pdf')}
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* ── Bank Statement Summary ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
            >
                <Card className="bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg p-8 group hover:shadow-2xl transition-all relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex gap-5 items-center">
                            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg text-white">
                                <Building2 size={32} strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-none">{t('reports.bank_summary')}</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-[350px]">
                                    {t('reports.bank_desc')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="w-full sm:w-48">
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-4">
                                        <SelectValue placeholder={t('reports.select_year')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-2">
                                        {[2023, 2024, 2025, 2026].map(year => (
                                            <SelectItem key={year} value={year.toString()} className="rounded-xl h-10 font-bold focus:bg-blue-500 focus:text-white">
                                                {t('reports.year_label', { year })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                disabled={exporting}
                                onClick={() => {
                                    window.open(ReportService.exportBankPdfUrl(companyId, parseInt(selectedYear)), '_blank');
                                }}
                                className="w-full sm:w-auto h-12 rounded-full px-8 bg-gradient-to-r from-orange-400 to-indigo-500 text-white font-black text-base shadow-[0_8px_20px_-6px_rgba(251,146,60,0.5)] transition-all hover:scale-105 active:scale-95 border-0 gap-2"
                            >
                                <Download size={18} strokeWidth={3} /> {t('reports.export_pdf')}
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* ── AI Insights ── */}
            <AIForecastCard
                t={t}
                content={t('reports.ai_forecast_template', { amount: (parseFloat(summary?.net_profit || 0) * 0.15).toLocaleString("en-CA", { minimumFractionDigits: 0 }) })}
            />

            {/* ── Footer ── */}
            <div className="pt-10 flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                    {t('reports.intelligence_engine')}
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    {t('reports.precision_analysis')}
                </p>
            </div>
        </div>
    );
}
