"use client";

import { useEffect, useState, useMemo } from "react";
import { SaleService, Sale } from "@/lib/sales-purchase-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Plus,
    ShoppingCart,
    ArrowUpRight,
    Search,
    Download,
    MoreVertical,
    Eye,
    Trash2,
    Filter,
    FileText,
    TrendingUp,
    Users,
    Calendar as CalendarIcon,
    MonitorSmartphone,
    ChevronLeft,
    ChevronRight,
    Edit2,
    CheckCircle2,
    Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PaymentHistoryModal } from "@/components/sales/PaymentHistoryModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

export default function SalesPage() {
    const router = useRouter();
    const { currentCompany } = useAuthStore();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [showPayments, setShowPayments] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [overrideEmail, setOverrideEmail] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        if (currentCompany) {
            loadSales();
        }
    }, [currentCompany]);

    async function loadSales() {
        if (!currentCompany) return;
        setLoading(true);
        try {
            const data = await SaleService.getAll(currentCompany.id);
            setSales(data);
        } catch (error) {
            console.error("Failed to load sales", error);
            toast.error("Failed to load sales data");
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await SaleService.delete(id);
            toast.success("Invoice deleted and stock reverted");
            loadSales();
        } catch (error) {
            toast.error("Failed to delete invoice");
        }
    };

    const handleMarkAsPaid = async (id: number) => {
        try {
            await SaleService.markAsPaid(id);
            toast.success("Invoice marked as fully paid");
            loadSales();
        } catch (error) {
            toast.error("Failed to update payment status");
        }
    };

    const handleDownload = async (sale: Sale) => {
        try {
            toast.loading("Generating PDF...", { id: "pdf-gen" });
            await SaleService.downloadPdf(sale.id!, sale.sales_code);
            toast.success("PDF downloaded successfully", { id: "pdf-gen" });
        } catch (error) {
            toast.error("Failed to generate PDF", { id: "pdf-gen" });
        }
    };

    const handleSendEmail = async (id: number, emailOverride?: string) => {
        const sale = sales.find(s => s.id === id);
        const currentEmail = emailOverride || (sale as any)?.customer?.email;

        if (!currentEmail && !emailOverride) {
            setSelectedSale(sale || null);
            setOverrideEmail("");
            setShowEmailDialog(true);
            return;
        }

        try {
            toast.loading("Sending email...", { id: "email-send" });
            await SaleService.sendEmail(id, emailOverride);
            toast.success("Invoice sent to " + (emailOverride || currentEmail), { id: "email-send" });
            setShowEmailDialog(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send email", { id: "email-send" });
        }
    };

    const filteredSales = useMemo(() => {
        return sales.filter(s =>
            s.sales_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s as any).customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.reference_no?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sales, searchQuery]);

    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    const paginatedSales = filteredSales.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const stats = useMemo(() => {
        const totalSales = sales.reduce((acc, s) => acc + Number(s.grand_total), 0);
        const totalReceived = sales.reduce((acc, s) => acc + Number(s.paid_amount || 0), 0);
        const totalPending = totalSales - totalReceived;
        return { totalSales, totalReceived, totalPending, count: sales.length };
    }, [sales]);

    if (loading && sales.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                    <p className="text-zinc-500 font-medium animate-pulse">Loading your sales universe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
            {/* Header section with glass effect */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform rotate-3 transition-transform hover:rotate-0">
                        <ShoppingCart size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tighter uppercase pr-4 leading-tight mb-1">
                            Sales & Invoicing
                        </h2>
                        <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            Manage your revenue stream and customer transactions elegantly.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-full border-zinc-200 dark:border-zinc-800 font-bold text-[10px] uppercase tracking-widest px-6 h-12 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Link href="/sales/new">
                        <Button className="rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-[10px] uppercase tracking-widest px-8 shadow-xl shadow-indigo-500/20 border-0 h-12 transition-all hover:scale-[1.02] active:scale-95">
                            <Plus className="mr-2 h-5 w-5" /> New Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <ModernStatCard
                    title="Gross Revenue"
                    value={`$${Number(stats.totalSales).toLocaleString()}`}
                    description="+12.5% vs last month"
                    icon={TrendingUp}
                    color="indigo"
                />
                <ModernStatCard
                    title="Total Collected"
                    value={`$${Number(stats.totalReceived).toLocaleString()}`}
                    description="Steady cashflow"
                    icon={ArrowUpRight}
                    color="emerald"
                />
                <ModernStatCard
                    title="Outstanding"
                    value={`$${Number(stats.totalPending).toLocaleString()}`}
                    description="Needs follow-up"
                    icon={FileText}
                    color="amber"
                />
                <ModernStatCard
                    title="Total Invoices"
                    value={stats.count.toString()}
                    description="High volume sales"
                    icon={ShoppingCart}
                    color="purple"
                />
            </div>

            {/* Table Area */}
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-96 group">
                            <Input
                                placeholder="Search invoices, clients, references..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 pl-12 bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-full focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="h-10 px-6 rounded-full border-zinc-200 dark:border-zinc-800 font-bold text-[10px] uppercase tracking-widest">
                                <Filter size={14} className="mr-2" /> More Filters
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                                <TableRow className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                                    <TableHead className="pl-8 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Invoice</TableHead>
                                    <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Customer</TableHead>
                                    <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Date</TableHead>
                                    <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Payment</TableHead>
                                    <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">Grand Total</TableHead>
                                    <TableHead className="pr-8 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSales.map((sale) => (
                                    <TableRow key={sale.id} className="border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all group">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                                    sale.reference_no === 'POS'
                                                        ? "bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400"
                                                        : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                                )}>
                                                    {sale.reference_no === 'POS' ? <MonitorSmartphone size={20} /> : <ReceiptIcon size={20} />}
                                                </div>
                                                <div>
                                                    <div className="font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                        {sale.sales_code}
                                                        {sale.reference_no === 'POS' && (
                                                            <Badge variant="outline" className="text-[9px] h-4 px-1 rounded bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200">POS</Badge>
                                                        )}
                                                    </div>
                                                    {sale.reference_no && (
                                                        <div className={cn(
                                                            "text-[10px] font-bold uppercase tracking-tighter",
                                                            sale.reference_no === 'POS' ? "text-orange-600 dark:text-orange-400" : "text-zinc-400"
                                                        )}>
                                                            Ref: {sale.reference_no}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                                    {(sale as any).customer?.name?.[0] || "?"}
                                                </div>
                                                <div className="font-bold text-zinc-700 dark:text-zinc-300">{(sale as any).customer?.name || "Walk-in Customer"}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-zinc-500 font-medium">
                                                <CalendarIcon size={14} className="opacity-40" />
                                                {new Date(sale.sales_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                onClick={() => { setSelectedSale(sale); setShowPayments(true); }}
                                                className={cn(
                                                    "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-0 shadow-lg shadow-black/5 cursor-pointer hover:opacity-80 transition-opacity",
                                                    sale.payment_status === 'Paid' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                                        sale.payment_status === 'Partial' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                                            "bg-red-500/10 text-red-600 dark:text-red-400"
                                                )}
                                            >
                                                {sale.payment_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-black text-zinc-900 dark:text-zinc-100 text-lg">
                                                ${Number(sale.grand_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-[10px] text-zinc-400 font-bold uppercase italic">
                                                Balance: ${(Number(sale.grand_total) - Number(sale.paid_amount || 0)).toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <div className="flex items-center justify-end gap-2 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/sales/edit/${sale.id}`)}
                                                    className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-violet-600"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => { setSelectedSale(sale); setShowPayments(true); }}
                                                    className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-600"
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDownload(sale)}
                                                    className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-emerald-600"
                                                >
                                                    <Download size={16} />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-zinc-300">
                                                            <MoreVertical size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-2 w-48">
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/sales/edit/${sale.id}`)}
                                                            className="rounded-xl font-bold text-zinc-600 dark:text-zinc-400"
                                                        >
                                                            <Edit2 size={16} className="mr-2" /> Edit Invoice
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleMarkAsPaid(sale.id!)}
                                                            className="rounded-xl font-bold text-zinc-600 dark:text-zinc-400"
                                                        >
                                                            <CheckCircle2 size={16} className="mr-2" /> Mark as Paid
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleSendEmail(sale.id!)}
                                                            className="rounded-xl font-bold text-zinc-600 dark:text-zinc-400"
                                                        >
                                                            <Mail size={16} className="mr-2" /> Send via Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800 opacity-50" />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem
                                                                    onSelect={(e) => e.preventDefault()}
                                                                    className="rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                                >
                                                                    <Trash2 size={16} className="mr-2" /> Delete Forever
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent className="rounded-xl border-0 shadow-2xl p-0 overflow-hidden max-w-md">
                                                                <div className="bg-red-500 p-8 text-white relative">
                                                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                                                        <Trash2 size={120} />
                                                                    </div>
                                                                    <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                                                                        <Trash2 size={28} />
                                                                    </div>
                                                                    <AlertDialogTitle className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">
                                                                        Delete Invoice?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-red-50 font-bold text-sm leading-relaxed opacity-90">
                                                                        This will permanently delete invoice <span className="underline decoration-2">{sale.sales_code}</span> and revert the product stock levels. This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </div>
                                                                <AlertDialogFooter className="p-8 bg-white dark:bg-zinc-950 gap-3">
                                                                    <AlertDialogCancel className="rounded-full border-zinc-200 dark:border-zinc-800 font-black uppercase tracking-widest text-[10px] px-8 h-12 hover:bg-zinc-50 transition-all">
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(sale.id!)}
                                                                        className="bg-red-600 hover:bg-red-700 text-white rounded-full font-black uppercase tracking-widest text-[10px] px-10 h-12 shadow-xl shadow-red-500/25 border-0 transition-all hover:scale-[1.02] active:scale-95"
                                                                    >
                                                                        Confirm Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filteredSales.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 py-12">
                                                <div className="h-20 w-20 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-200 dark:text-zinc-700">
                                                    <ShoppingCart size={40} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">No sales found</p>
                                                    <p className="text-sm text-zinc-500 font-bold">Add your first invoice to see it here.</p>
                                                </div>
                                                <Link href="/sales/new">
                                                    <Button className="rounded-full bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest h-11 px-8 border-0">
                                                        Start Invoicing
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {filteredSales.length > 0 && (
                        <div className="px-8 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest order-2 sm:order-1">
                                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length} Records
                            </span>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-3 order-1 sm:order-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="h-10 w-10 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeft size={18} />
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
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <PaymentHistoryModal
                sale={selectedSale}
                open={showPayments}
                onClose={() => { setShowPayments(false); setSelectedSale(null); }}
            />

            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogContent className="max-w-md rounded-xl border-0 shadow-2xl p-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Mail size={120} />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">
                                Send via Email
                            </DialogTitle>
                            <DialogDescription className="text-indigo-100 font-bold text-sm leading-relaxed opacity-90">
                                Enter the recipient email address for invoice <span className="underline decoration-2">{selectedSale?.sales_code}</span>.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6 bg-white dark:bg-zinc-950">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Recipient Email</label>
                            <div className="relative group/email">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within/email:text-indigo-500 transition-colors" size={18} />
                                <Input
                                    type="email"
                                    placeholder="customer@example.com"
                                    value={overrideEmail}
                                    onChange={(e) => setOverrideEmail(e.target.value)}
                                    className="h-14 pl-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowEmailDialog(false)}
                                className="flex-1 h-12 rounded-full border-zinc-200 dark:border-zinc-800 font-black uppercase tracking-widest text-[10px] px-8"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => selectedSale && handleSendEmail(selectedSale.id!, overrideEmail)}
                                className="flex-[2] h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-indigo-500/20"
                            >
                                <Mail className="mr-2" size={16} /> Send Invoice
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ReceiptIcon({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
            <path d="M12 17.5V6.5" />
        </svg>
    )
}

 function ModernStatCard({ title, value, description, icon: Icon, color }: any) {
    const gradientClasses: any = {
        indigo: "bg-gradient-to-r from-[#2B5BFF] to-[#5138EE]",
        emerald: "bg-gradient-to-r from-[#00D09E] to-[#019DA3]",
        amber: "bg-gradient-to-r from-[#FF8800] to-[#FF3B3B]",
        purple: "bg-gradient-to-r from-[#AD3BFC] to-[#713BFF]",
    };

    return (
        <Card className={cn("border-0 rounded-xl overflow-hidden text-white transition-all duration-300 shadow-xl hover:-translate-y-1 relative group w-full", gradientClasses[color])}>
            <CardContent className="p-5 flex flex-col justify-center h-[120px]">
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
            </CardContent>
        </Card>
    );
}
