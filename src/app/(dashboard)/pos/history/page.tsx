"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SaleService, Sale } from "@/lib/sales-purchase-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Receipt,
    PlusSquare,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    Trash2,
    Loader2,
    TrendingUp,
    ShoppingCart,
    Calendar,
    Download,
    Filter,
    Edit2,
    X,
    Save,
    MoreHorizontal,
    MoreVertical,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PaymentHistoryModal } from "@/components/sales/PaymentHistoryModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react";

import { useTranslation } from "@/i18n/TranslationContext";

export default function PosHistoryPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { currentCompany } = useAuthStore();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showPayments, setShowPayments] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;



    const loadSales = async () => {
        if (!currentCompany) return;
        try {
            setLoading(true);
            const data = await SaleService.getAll(currentCompany.id);
            setSales(data);
        } catch {
            toast.error(t('pos.failed_to_load_history'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, [currentCompany]);



    const handleDelete = async (id: number) => {
        if (!confirm(t('pos.confirm_delete_sale'))) return;
        try {
            await SaleService.delete(id);
            toast.success(t('pos.sale_deleted_success'));
            loadSales();
        } catch {
            toast.error(t('pos.failed_to_delete_sale'));
        }
    };

    const handleDownload = async (sale: Sale) => {
        try {
            toast.loading(t('pos.generating_pdf'), { id: "pdf-gen" });
            await SaleService.downloadPdf(sale.id!, sale.sales_code);
            toast.success(t('pos.pdf_download_success'), { id: "pdf-gen" });
        } catch {
            toast.error(t('pos.failed_to_generate_pdf'), { id: "pdf-gen" });
        }
    };

    const handleRefund = async (sale: Sale) => {
        if (!sale.id) return;
        if (!confirm(t('pos.confirm_refund_sale', { code: sale.sales_code }))) return;

        try {
            toast.loading(t('pos.processing_refund'), { id: "refund-process" });
            await SaleService.refund(sale.id);
            toast.success(t('pos.refund_success'), { id: "refund-process" });
            loadSales();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('pos.failed_to_refund'), { id: "refund-process" });
        }
    };

    const filtered = sales.filter((sale) => {
        const matchSearch =
            sale.sales_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sale as any).customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.reference_no?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === "all" || sale.payment_status?.toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedSales = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when searching or filtering
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const totalSales = sales.reduce((s, t) => s + parseFloat(String(t.grand_total)), 0);
    const totalPaid = sales.reduce((s, t) => s + parseFloat(String(t.paid_amount || 0)), 0);
    const totalPending = totalSales - totalPaid;

    const currency = currentCompany?.currency || "USD";

    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

    return (
        <div className="w-full p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight leading-tight uppercase pr-4 pt-[5px]">
                            {t('pos.history_title')}
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            {t('pos.history_desc')}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <Input
                            placeholder={t('pos.search_placeholder')}
                            className="pl-12 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => router.push("/pos")}
                        className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 text-white rounded-full px-8 h-11 shadow-lg shadow-indigo-500/20 font-black uppercase tracking-tighter transition-all hover:scale-[1.02] active:scale-95 border-0"
                    >
                        <PlusSquare className="mr-2 h-5 w-5" /> {t('pos.new_sale')}
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <ModernStatCard title={t('pos.gross_sales')} value={`${currency} ${fmt(totalSales)}`} description={t('pos.gross_sales_desc')} icon={TrendingUp} color="indigo" />
                <ModernStatCard title={t('pos.collected')} value={`${currency} ${fmt(totalPaid)}`} description={t('pos.collected_desc')} icon={CheckCircle2} color="emerald" />
                <ModernStatCard title={t('pos.outstanding')} value={`${currency} ${fmt(totalPending)}`} description={t('pos.outstanding_desc')} icon={Clock} color="amber" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 h-10 shadow-sm">
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{t('pos.payment_label')}</span>
                    {["all", "paid", "partial", "unpaid"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`text-xs font-bold px-4 py-1 rounded-full transition-all ${statusFilter === s
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                }`}
                        >
                            {t(`common.${s}`)}
                        </button>
                    ))}
                </div>

                <Button variant="outline" className="rounded-full border-zinc-200 dark:border-zinc-800 h-10 px-6 font-bold text-[10px] uppercase tracking-widest">
                    <Filter size={14} className="mr-2" /> {t('common.more_filters')}
                </Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">{t('pos.syncing_data')}</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                    <div className="mt-2">
                        <Table>
                            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800">
                                    <TableHead className="px-8 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('pos.sale_info')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('pos.customer')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('pos.date')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('pos.payment_method')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('pos.grand_total')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('pos.status')}</TableHead>
                                    <TableHead className="px-8 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">{t('pos.action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {paginatedSales.map((sale) => (
                                    <TableRow key={sale.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group border-zinc-100 dark:border-zinc-800">
                                        <TableCell className="px-8 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-zinc-900 dark:text-zinc-100 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">
                                                    {sale.sales_code}
                                                </span>
                                                {sale.reference_no && (
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">REF: {sale.reference_no}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400">
                                                    {(sale as any).customer?.name?.[0] || "W"}
                                                </div>
                                                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                                                    {(sale as any).customer?.name || t('pos.walk_in_customer')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
                                                <Calendar size={13} className="opacity-40" />
                                                <span className="text-xs">
                                                    {new Date(sale.sales_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge variant="outline" className="rounded-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider px-3 py-0.5">
                                                {sale.payment_type || t('common.cash')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-zinc-900 dark:text-zinc-100 text-base">
                                                    {currency} {fmt(parseFloat(String(sale.grand_total)))}
                                                </span>
                                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                                                    {t('pos.paid')}: {fmt(parseFloat(String(sale.paid_amount || 0)))}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <StatusBadge status={sale.payment_status || 'Paid'} t={t} />
                                        </TableCell>
                                        <TableCell className="px-8 py-4 text-right">
                                            <div className="flex justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                                            <MoreVertical size={16} className="text-zinc-500" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/sales/edit/${sale.id}`)}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 text-violet-600 transition-colors font-bold text-xs uppercase tracking-wider"
                                                        >
                                                            <Edit2 size={14} /> {t('pos.edit_sale')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => { setSelectedSale(sale); setShowPayments(true); }}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 transition-colors font-bold text-xs uppercase tracking-wider"
                                                        >
                                                            <Eye size={14} /> {t('pos.view_details')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDownload(sale)}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 transition-colors font-bold text-xs uppercase tracking-wider"
                                                        >
                                                            <Download size={14} /> {t('pos.download_pdf')}
                                                        </DropdownMenuItem>
                                                        {sale.payment_status !== 'Refunded' && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleRefund(sale)}
                                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-colors font-bold text-xs uppercase tracking-wider"
                                                            >
                                                                <RotateCcw size={14} /> {t('pos.refund_sale')}
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(sale.id!)}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-colors font-bold text-xs uppercase tracking-wider"
                                                        >
                                                            <Trash2 size={14} /> {t('pos.delete_sale')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-24 w-24 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-200 mb-6">
                                                    <ShoppingCart size={48} />
                                                </div>
                                                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase">{t('pos.no_records')}</h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mt-2 font-medium">
                                                    {searchTerm || statusFilter !== "all"
                                                        ? t('pos.no_records_matching')
                                                        : t('pos.no_records_desc')}
                                                </p>
                                                {(!searchTerm && statusFilter === "all") && (
                                                    <Button
                                                        onClick={() => router.push("/pos")}
                                                        className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full h-12 px-10 font-black uppercase tracking-tighter shadow-xl shadow-indigo-500/20"
                                                    >
                                                        <PlusSquare className="mr-2 h-5 w-5" /> {t('pos.launch_terminal')}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {filtered.length > 0 && (
                        <div className="px-8 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest order-2 sm:order-1">
                                {t('common.showing_records', {
                                    start: (currentPage - 1) * itemsPerPage + 1,
                                    end: Math.min(currentPage * itemsPerPage, filtered.length),
                                    total: filtered.length
                                })}
                            </span>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-3 order-1 sm:order-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="h-10 w-10 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeftIcon size={18} />
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) {
                                            pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                                        }

                                        const isActive = currentPage === pageNum;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={cn(
                                                    "h-10 w-10 rounded-xl text-xs font-black transition-all flex items-center justify-center",
                                                    isActive
                                                        ? "bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-500/30"
                                                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700"
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-10 w-10 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronRightIcon size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <PaymentHistoryModal
                sale={selectedSale}
                open={showPayments}
                onClose={() => { setShowPayments(false); setSelectedSale(null); }}
            />


        </div>
    );
}

function StatusBadge({ status, t }: { status: string; t: any }) {
    const s = status?.toLowerCase();
    switch (s) {
        case "paid":
            return (
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <CheckCircle2 size={10} /> {t('common.paid')}
                </span>
            );
        case "partial":
            return (
                <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <Clock size={10} /> {t('common.partial')}
                </span>
            );
        case "unpaid":
            return (
                <span className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <XCircle size={10} /> {t('common.unpaid')}
                </span>
            );
        case "refunded":
            return (
                <span className="inline-flex items-center gap-1.5 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <RotateCcw size={10} /> {t('pos.refunded')}
                </span>
            );
        default:
            return <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{status}</span>;
    }
}

function ModernStatCard({ title, value, description, icon: Icon, color }: any) {
    const gradientClasses: any = {
        indigo: "bg-gradient-to-r from-[#2B5BFF] to-[#5138EE]",
        emerald: "bg-gradient-to-r from-[#00D09E] to-[#019DA3]",
        amber: "bg-gradient-to-r from-[#FF8800] to-[#FF3B3B]",
    };

    return (
        <div className={cn("rounded-xl overflow-hidden text-white transition-all duration-300 shadow-xl hover:-translate-y-1 relative group w-full", gradientClasses[color])}>
            <div className="p-5 flex flex-col justify-center h-[120px]">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[15px] uppercase font-bold tracking-wider text-white/90 drop-shadow-sm">{title}</p>
                        <h3 className="text-3xl font-black tracking-tight text-white drop-shadow-md">{value}</h3>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mt-1 shadow-inner border border-white/10">
                        <Icon size={16} className="text-white drop-shadow-sm" strokeWidth={2.5} />
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/90 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-90"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
                    <span>{description}</span>
                </div>
            </div>
        </div>
    );
}
