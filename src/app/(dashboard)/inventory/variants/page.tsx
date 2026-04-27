"use client";

import { useState, useEffect, useCallback } from "react";
import { VariantService, Variant } from "@/lib/variant-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Layers,
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    X,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
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

/* ─── Types & Extended Interface ─────────────────────────────────────────── */
interface ExtendedVariant extends Variant {
    description?: string;
    status: 'Active' | 'Inactive';
}

export default function VariantsPage() {
    const { t } = useTranslation();
    const { currentCompany } = useAuthStore();
    const [variants, setVariants] = useState<ExtendedVariant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    /* Pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    /* Drawer/Modal state */
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        status: "Active" as 'Active' | 'Inactive'
    });
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        if (!currentCompany) return;
        try {
            setLoading(true);
            const data = await VariantService.getAll(currentCompany.id);
            const mapped = data.map(v => ({
                ...v,
                description: (v as any).description || "",
                status: (v as any).status || "Active"
            }));
            setVariants(mapped as ExtendedVariant[]);
        } catch {
            toast.error(t('inventory.load_variants_failed'));
        } finally {
            setLoading(false);
        }
    }, [currentCompany, t]);

    useEffect(() => { load(); }, [load]);

    const filtered = variants.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const openAdd = () => {
        setEditingId(null);
        setForm({ name: "", description: "", status: "Active" });
        setDrawerOpen(true);
    };

    const openEdit = (v: ExtendedVariant) => {
        setEditingId(v.id);
        setForm({ name: v.name, description: v.description || "", status: v.status });
        setDrawerOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !currentCompany) return;
        setSaving(true);
        try {
            const payload = {
                ...form,
                company_id: currentCompany.id
            };

            if (editingId) {
                await VariantService.update(editingId, payload);
                toast.success(t('inventory.save_variant_success'));
            } else {
                await VariantService.create(payload);
                toast.success(t('inventory.save_variant_success'));
            }
            setDrawerOpen(false);
            load();
        } catch {
            toast.error(t('inventory.save_variant_failed'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await VariantService.delete(id);
            toast.success(t('inventory.delete_variant_success'));
            load();
        } catch {
            toast.error(t('inventory.delete_variant_failed'));
        }
    };

    return (
        <div className="w-full p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-700">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-[1.5rem] bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 relative group transition-all duration-500 hover:scale-105">
                        <Layers size={24} strokeWidth={2.5} className="relative z-10" />
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-400 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter uppercase leading-tight pt-[5px]">
                            {t('inventory.variants_list_title')}
                        </h1>
                        <p className="text-[9px] md:text-[11px] text-zinc-500 dark:text-zinc-400 font-black tracking-[0.2em] uppercase opacity-70">
                            {t('inventory.variants_subtitle')}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <Input
                            placeholder={t('inventory.find_variant')}
                            className="pl-12 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={openAdd}
                        className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full px-10 h-12 shadow-xl shadow-orange-500/20 font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95 border-0"
                    >
                        <Plus size={18} strokeWidth={3} className="mr-2" /> {t('inventory.new_variant')}
                    </Button>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                <div className="mt-2">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                            <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800">
                                <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('inventory.table_variant_name')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest max-w-[150px]">{t('inventory.description')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('inventory.table_status')}</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-left w-[120px]">{t('inventory.table_action')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="px-6 py-20 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="px-6 py-20 text-center text-zinc-400 font-medium">
                                        {t('inventory.no_variants_found')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((v) => (
                                    <TableRow key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-zinc-100 dark:border-zinc-800">
                                        <TableCell className="px-6 py-4 font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
                                            {v.name}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium max-w-[150px] truncate">
                                            {v.description || "-"}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                                                v.status === "Active"
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-zinc-200 text-zinc-600"
                                            )}>
                                                {v.status === "Active" ? t('inventory.active') : t('inventory.inactive')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="default" className="bg-[#4192B3] hover:bg-[#367a96] text-white rounded-md h-9 px-4 flex items-center gap-2 font-bold text-xs uppercase border-0">
                                                        {t('inventory.table_action')} <ChevronDown size={14} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-2 min-w-[140px]">
                                                    <DropdownMenuItem onClick={() => openEdit(v)} className="rounded-lg h-10 gap-3 font-bold text-xs uppercase tracking-tighter cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                                        <Edit2 size={14} className="text-blue-500" /> {t('inventory.edit')}
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <div className="flex items-center gap-3 px-2 py-2 rounded-lg font-bold text-xs uppercase tracking-tighter cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors">
                                                                <Trash2 size={14} /> {t('inventory.delete')}
                                                            </div>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-xl border-0 shadow-2xl p-0 overflow-hidden">
                                                            <div className="bg-red-500 p-8 text-white">
                                                                <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4"><Trash2 size={28} /></div>
                                                                <AlertDialogTitle className="text-2xl font-black tracking-tighter uppercase leading-none">{t('inventory.delete_variant_confirm_title')}</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-red-50 mt-2 font-medium">{t('inventory.delete_variant_confirm_desc', { name: v.name })}</AlertDialogDescription>
                                                            </div>
                                                            <AlertDialogFooter className="p-6 bg-white dark:bg-zinc-950 gap-3">
                                                                <AlertDialogCancel className="rounded-full border-zinc-200 font-bold px-8 h-12">{t('inventory.cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(v.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-10 h-12 border-0">{t('inventory.confirm_delete')}</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Pagination */}
                {filtered.length > 0 && (
                    <div className="px-8 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest order-2 sm:order-1">
                            {t('inventory.showing_variants', {
                                start: (currentPage - 1) * itemsPerPage + 1,
                                end: Math.min(currentPage * itemsPerPage, filtered.length),
                                total: filtered.length
                            })}
                        </span>

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

            {/* ── Drawer ── */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    <div className="relative ml-auto h-full w-full max-w-sm bg-white dark:bg-zinc-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600" />
                        <div className="p-8 space-y-8 flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black tracking-tighter uppercase leading-none bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                    {editingId ? t('inventory.edit_variant') : t('inventory.create_variant')}
                                </h3>
                                <button onClick={() => setDrawerOpen(false)} className="h-8 w-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400"><X size={20} /></button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest leading-none">{t('inventory.variant_name_label')}</label>
                                    <Input
                                        placeholder={t('inventory.variant_name_placeholder')}
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="rounded-2xl h-12 bg-zinc-50 border-transparent focus:border-blue-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest leading-none">{t('inventory.description')}</label>
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full rounded-2xl border-transparent bg-zinc-50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest leading-none">{t('inventory.table_status')}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['Active', 'Inactive'] as const).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setForm({ ...form, status: s })}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                                                    form.status === s
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                                                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500"
                                                )}
                                            >
                                                {s === 'Active' ? t('inventory.active') : t('inventory.inactive')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full rounded-2xl h-14 font-black bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 text-white border-0 shadow-xl shadow-blue-500/25 uppercase tracking-tighter hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                            >
                                {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Check className="h-5 w-5" />}
                                {editingId ? t('inventory.save_changes') : t('inventory.create_variant')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
