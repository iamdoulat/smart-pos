"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductService } from "@/lib/product-service";
import { useAuthStore } from "@/lib/store";
import { useTranslation } from "@/i18n/TranslationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Package,
    Search,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    BarChart3,
    X,
    Check,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn, getAssetUrl } from "@/lib/utils";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react";

/* ─── Types ────────────────────────────────────────────────────────────── */
interface Product {
    id: number;
    company_id: number;
    name: string;
    sku?: string | null;
    description?: string | null;
    purchase_price: number | string;
    sales_price: number | string;
    stock_quantity: number;
    low_stock_threshold: number;
    image_url?: string | null;
}

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";

const EMPTY_FORM = {
    name: "",
    sku: "",
    description: "",
    purchase_price: "",
    sales_price: "",
    stock_quantity: "",
    low_stock_threshold: "10",
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const stockStatus = (qty: number, threshold: number): "out" | "low" | "ok" => {
    if (qty <= 0) return "out";
    if (qty <= threshold) return "low";
    return "ok";
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function InventoryPage() {
    const { t } = useTranslation();
    const { currentCompany } = useAuthStore();
    const currency = currentCompany?.currency || "USD";
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState<StockFilter>("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    /* ── Modal state ── */

    /* ── Load ─────────────────────────────────────────────────────────── */
    const load = useCallback(async () => {
        if (!currentCompany) return;
        try {
            setLoading(true);
            const data = await ProductService.getAll(currentCompany.id);
            setProducts(data);
        } catch {
            toast.error(t('inventory.load_failed'));
        } finally {
            setLoading(false);
        }
    }, [currentCompany]);

    useEffect(() => { load(); }, [load]);

    /* ── Derived stats ────────────────────────────────────────────────── */
    const totalStockValue = products.reduce(
        (s, p) => s + parseFloat(p.sales_price.toString()) * p.stock_quantity, 0
    );
    const lowStockCount = products.filter(
        (p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold
    ).length;
    const outOfStockCount = products.filter((p) => p.stock_quantity <= 0).length;

    /* ── Filtered list ────────────────────────────────────────────────── */
    const filtered = products.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            p.name.toLowerCase().includes(q) ||
            (p.sku?.toLowerCase().includes(q) ?? false) ||
            (p.description?.toLowerCase().includes(q) ?? false);

        const st = stockStatus(p.stock_quantity, p.low_stock_threshold);
        const matchStock =
            stockFilter === "all" ||
            (stockFilter === "in_stock" && st === "ok") ||
            (stockFilter === "low_stock" && st === "low") ||
            (stockFilter === "out_of_stock" && st === "out");

        return matchSearch && matchStock;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when searching or filtering
    useEffect(() => {
        setCurrentPage(1);
    }, [search, stockFilter]);

    /* ── Delete Action ── */

    const handleDelete = async (id: number) => {
        try {
            await ProductService.delete(id);
            toast.success(t('inventory.delete_success'));
            load();
        } catch {
            toast.error(t('inventory.delete_failed'));
        }
    };

    /* ══════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════ */
    return (
        <div className="w-full p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-[1.5rem] bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 relative group transition-all duration-500 hover:scale-105">
                        <Package size={24} strokeWidth={2.5} className="relative z-10" />
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-400 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter uppercase leading-tight pt-[5px]">
                            {t('inventory.title')}
                        </h1>
                        <p className="text-[9px] md:text-[11px] text-zinc-500 dark:text-zinc-400 font-black tracking-[0.2em] uppercase opacity-70">
                            {t('inventory.subtitle')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <Input
                            placeholder={t('inventory.search_placeholder')}
                            className="pl-12 h-11 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => router.push("/inventory/add")}
                        className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full px-8 h-11 shadow-lg shadow-orange-500/20 font-black uppercase tracking-tighter transition-all hover:scale-[1.02] active:scale-95 border-0 whitespace-nowrap"
                    >
                        <Plus className="mr-2 h-5 w-5" /> {t('inventory.add_product')}
                    </Button>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    label={t('inventory.total_products')}
                    value={String(products.length)}
                    icon={Package}
                    gradient="from-blue-500 via-blue-600 to-indigo-700"
                    shadow="shadow-blue-500/30"
                />
                <SummaryCard
                    label={t('inventory.stock_value')}
                    value={`${currency} ${fmt(totalStockValue)}`}
                    icon={DollarSign}
                    gradient="from-teal-400 via-emerald-500 to-cyan-600"
                    shadow="shadow-emerald-500/30"
                />
                <SummaryCard
                    label={t('inventory.low_stock')}
                    value={String(lowStockCount)}
                    icon={AlertTriangle}
                    gradient="from-purple-500 via-violet-600 to-indigo-700"
                    shadow="shadow-purple-500/30"
                />
                <SummaryCard
                    label={t('inventory.out_of_stock')}
                    value={String(outOfStockCount)}
                    icon={BarChart3}
                    gradient="from-orange-400 via-orange-500 to-rose-500"
                    shadow="shadow-orange-500/30"
                />
            </div>

            {/* ── Stock Filter Pills ── */}
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 h-11 w-fit shadow-sm flex-wrap">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t('inventory.stock_filter')}</span>
                {([
                    { key: "all", label: t('inventory.filter_all') },
                    { key: "in_stock", label: t('inventory.filter_in_stock') },
                    { key: "low_stock", label: t('inventory.filter_low_stock') },
                    { key: "out_of_stock", label: t('inventory.filter_out_of_stock') },
                ] as const).map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setStockFilter(key)}
                        className={cn(
                            "text-xs font-bold px-3 py-1 rounded-full transition-all",
                            stockFilter === key
                                ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Table ── */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                    <div className="mt-2">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                                <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800">
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('inventory.table_product')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('inventory.table_sku')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('inventory.table_buy_price')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('inventory.table_sell_price')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('inventory.table_margin')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('inventory.table_stock')}</TableHead>
                                    <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">{t('inventory.table_action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {paginated.map((p) => {
                                    const buyP = parseFloat(p.purchase_price.toString());
                                    const sellP = parseFloat(p.sales_price.toString());
                                    const margin = buyP > 0 ? ((sellP - buyP) / buyP) * 100 : 0;

                                    return (
                                        <TableRow key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group border-zinc-100 dark:border-zinc-800">
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                                        {p.image_url ? (
                                                            <img
                                                                src={getAssetUrl(p.image_url)}
                                                                alt={p.name}
                                                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = ""; // Clear on error
                                                                }}
                                                            />
                                                        ) : (
                                                            <Package size={18} className="text-zinc-400 group-hover:text-violet-500 transition-colors" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{p.name}</p>
                                                        {p.description && (
                                                            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5 max-w-[180px]">{p.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-6 py-4">
                                                {p.sku ? (
                                                    <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-600 dark:text-zinc-400">
                                                        {p.sku}
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-300 dark:text-zinc-600">—</span>
                                                )}
                                            </TableCell>

                                            <TableCell className="px-6 py-4">
                                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                                    {currency} {fmt(buyP)}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-6 py-4">
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                    {currency} {fmt(sellP)}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
                                                    margin >= 0
                                                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                                                )}>
                                                    <TrendingUp size={11} />
                                                    {margin.toFixed(1)}%
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-6 py-4">
                                                <StockBadge qty={p.stock_quantity} threshold={p.low_stock_threshold} />
                                            </TableCell>

                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                                                <MoreVertical size={16} className="text-zinc-500" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                                                            <DropdownMenuItem
                                                                onClick={() => router.push(`/inventory/edit/${p.id}`)}
                                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 text-violet-600 transition-colors font-bold text-xs uppercase tracking-wider"
                                                            >
                                                                <Edit2 size={14} /> {t('inventory.edit_product')}
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-800" />

                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem
                                                                        onSelect={(e) => e.preventDefault()}
                                                                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-colors font-bold text-xs uppercase tracking-wider"
                                                                    >
                                                                        <Trash2 size={14} /> {t('inventory.delete_product')}
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="rounded-xl border-0 shadow-2xl p-0 overflow-hidden">
                                                                    <div className="bg-red-500 p-8 text-white">
                                                                        <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                                                                            <Trash2 size={28} />
                                                                        </div>
                                                                        <AlertDialogTitle className="text-2xl font-black tracking-tighter uppercase leading-none">
                                                                            {t('inventory.delete_confirm_title')}
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription className="text-red-50 mt-2 font-medium">
                                                                            {t('inventory.delete_confirm_desc', { name: p.name })}
                                                                        </AlertDialogDescription>
                                                                    </div>
                                                                    <AlertDialogFooter className="p-6 bg-white dark:bg-zinc-950 gap-3">
                                                                        <AlertDialogCancel className="rounded-full border-zinc-200 dark:border-zinc-800 font-bold px-8 h-12">
                                                                            {t('inventory.cancel')}
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(p.id)}
                                                                            className="bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-10 h-12 shadow-lg shadow-red-500/20 border-0"
                                                                        >
                                                                            {t('inventory.confirm_delete')}
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {/* Empty state */}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20 flex items-center justify-center mb-6">
                                                    <Package size={40} className="text-violet-400" />
                                                </div>
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                                    {search || stockFilter !== "all" ? t('inventory.no_products_found') : t('inventory.no_products_yet')}
                                                </h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mt-2 font-medium leading-relaxed">
                                                    {search || stockFilter !== "all"
                                                        ? t('inventory.adjust_filters_hint')
                                                        : t('inventory.add_first_hint')}
                                                </p>
                                                {!search && stockFilter === "all" && (
                                                    <Button
                                                        onClick={() => router.push("/inventory/add")}
                                                        className="mt-8 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full h-12 px-8 font-bold shadow-lg shadow-violet-500/20 border-0"
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" /> {t('inventory.add_first_product')}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer count */}
                    {filtered.length > 0 && (
                        <div className="px-8 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest order-2 sm:order-1">
                                {t('inventory.showing_records', { start: (currentPage - 1) * itemsPerPage + 1, end: Math.min(currentPage * itemsPerPage, filtered.length), total: filtered.length })}
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

            {/* Bottom spacer */}
            <div className="h-4" />
        </div>
    );
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function SummaryCard({
    label,
    value,
    icon: Icon,
    gradient,
    shadow,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    gradient: string;
    shadow: string;
}) {
    return (
        <div className={cn(
            "relative rounded-xl p-5 flex items-center justify-between overflow-hidden cursor-default",
            "bg-gradient-to-br", gradient,
            "shadow-xl", shadow,
            "transition-transform hover:-translate-y-0.5 hover:shadow-xl"
        )}>
            {/* Decorative blurred circle */}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -top-6 -left-4 h-20 w-20 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <div className="relative z-10">
                <p className="text-[15px] text-white/90 font-bold uppercase tracking-widest mb-1">
                    {label}
                </p>
                <p className="text-2xl font-black text-white truncate">{value}</p>
            </div>

            <div className="relative z-10 h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Icon size={22} className="text-white" />
            </div>
        </div>
    );
}

function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
    const { t } = useTranslation();
    const st = stockStatus(qty, threshold);
    if (st === "out")
        return (
            <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {t('inventory.filter_out_of_stock')}
            </span>
        );
    if (st === "low")
        return (
            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                <AlertTriangle size={10} />
                {t('inventory.filter_low_stock')}: {qty}
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t('inventory.in_stock_msg', { qty })}
        </span>
    );
}

function Field({
    label,
    required,
    hint,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                {label}
                {required && <span className="text-rose-500">*</span>}
                {hint && <span className="text-zinc-400 normal-case font-medium tracking-normal">— {hint}</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
}
