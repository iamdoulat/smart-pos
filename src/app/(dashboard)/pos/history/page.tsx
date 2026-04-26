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

export default function PosHistoryPage() {
    const router = useRouter();
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
            toast.error("Failed to load sales history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, [currentCompany]);



    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this sale? This will revert product stock.")) return;
        try {
            await SaleService.delete(id);
            toast.success("Sale deleted and stock reverted");
            loadSales();
        } catch {
            toast.error("Failed to delete sale");
        }
    };

    const handleDownload = async (sale: Sale) => {
        try {
            toast.loading("Generating PDF...", { id: "pdf-gen" });
            await SaleService.downloadPdf(sale.id!, sale.sales_code);
            toast.success("PDF downloaded successfully", { id: "pdf-gen" });
        } catch {
            toast.error("Failed to generate PDF", { id: "pdf-gen" });
        }
    };

    const handleRefund = async (sale: Sale) => {
        if (!sale.id) return;
        if (!confirm(`Are you sure you want to refund sale ${sale.sales_code}? This will restock items and mark the sale as Refunded.`)) return;

        try {
            toast.loading("Processing refund...", { id: "refund-process" });
            await SaleService.refund(sale.id);
            toast.success("Sale refunded and stock restocked", { id: "refund-process" });
            loadSales();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to process refund", { id: "refund-process" });
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
        <div className="w-full space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20 px-8 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform rotate-3 transition-transform hover:rotate-0">
                        <Receipt size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tighter uppercase pr-4 leading-tight mb-1">
                            POS History
                        </h2>
                        <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            Track and manage all your terminal sales and receipts.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <Input
                            placeholder="Search by code, client, ref..."
                            className="pl-12 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => router.push("/pos")}
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-full px-8 h-12 shadow-lg shadow-indigo-500/25 font-black uppercase tracking-tighter transition-all hover:scale-[1.02] active:scale-95 border-0"
                    >
                        <PlusSquare className="mr-2 h-5 w-5" /> New Terminal Sale
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <ModernStatCard title="Gross Sales" value={`${currency} ${fmt(totalSales)}`} description="Total sales volume from POS" icon={TrendingUp} color="indigo" />
                <ModernStatCard title="Collected" value={`${currency} ${fmt(totalPaid)}`} description="Payments received successfully" icon={CheckCircle2} color="emerald" />
                <ModernStatCard title="Outstanding" value={`${currency} ${fmt(totalPending)}`} description="Pending or partial balances" icon={Clock} color="amber" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 h-10 shadow-sm">
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Payment:</span>
                    {["all", "paid", "partial", "unpaid"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`text-xs font-bold px-4 py-1 rounded-full transition-all ${statusFilter === s
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                }`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>

                <Button variant="outline" className="rounded-full border-zinc-200 dark:border-zinc-800 h-10 px-6 font-bold text-[10px] uppercase tracking-widest">
                    <Filter size={14} className="mr-2" /> More Filters
                </Button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                        <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Syncing Sales Data...</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                    <div className="mt-2">
                        <Table>
                            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800">
                                    <TableHead className="px-8 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Sale Info</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Customer</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Date</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Payment Method</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Grand Total</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="px-8 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">Action</TableHead>
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
                                                    {(sale as any).customer?.name || "Walk-in Customer"}
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
                                                {sale.payment_type || "Cash"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-zinc-900 dark:text-zinc-100 text-base">
                                                    {currency} {fmt(parseFloat(String(sale.grand_total)))}
                                                </span>
                                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                                                    Paid: {fmt(parseFloat(String(sale.paid_amount || 0)))}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <StatusBadge status={sale.payment_status || 'Paid'} />
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
                                                            <Edit2 size={14} /> Edit Sale
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => { setSelectedSale(sale); setShowPayments(true); }}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 transition-colors font-bold text-xs uppercase tracking-wider"
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDownload(sale)}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 transition-colors font-bold text-xs uppercase tracking-wider"
                                                        >
                                                            <Download size={14} /> Download PDF
                                                        </DropdownMenuItem>
                                                        {sale.payment_status !== 'Refunded' && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleRefund(sale)}
                                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-colors font-bold text-xs uppercase tracking-wider"
                                                            >
                                                                <RotateCcw size={14} /> Refund Sale
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(sale.id!)}
                                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-colors font-bold text-xs uppercase tracking-wider"
                                                        >
                                                            <Trash2 size={14} /> Delete Sale
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
                                                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase">No POS records found</h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mt-2 font-medium">
                                                    {searchTerm || statusFilter !== "all"
                                                        ? "No sales match your current search or filter criteria."
                                                        : "You haven't completed any sales through the POS terminal yet."}
                                                </p>
                                                {(!searchTerm && statusFilter === "all") && (
                                                    <Button
                                                        onClick={() => router.push("/pos")}
                                                        className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full h-12 px-10 font-black uppercase tracking-tighter shadow-xl shadow-indigo-500/20"
                                                    >
                                                        <PlusSquare className="mr-2 h-5 w-5" /> Launch Terminal
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
                                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} Records
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

function StatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase();
    switch (s) {
        case "paid":
            return (
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <CheckCircle2 size={10} /> Paid
                </span>
            );
        case "partial":
            return (
                <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <Clock size={10} /> Partial
                </span>
            );
        case "unpaid":
            return (
                <span className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <XCircle size={10} /> Unpaid
                </span>
            );
        case "refunded":
            return (
                <span className="inline-flex items-center gap-1.5 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <RotateCcw size={10} /> Refunded
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
