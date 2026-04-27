"use client";

import React, { useEffect, useState } from "react";
import {
    DollarSign,
    Plus,
    Pencil,
    Trash2,
    Check,
    Search,
    Loader2,
    AlertCircle,
    Globe,
    ArrowUpDown
} from "lucide-react";
import { useTranslation } from "@/i18n/TranslationContext";
import { Currency, CurrencyService } from "@/lib/currency-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CurrenciesPage() {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { t } = useTranslation();

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        symbol: "",
        exchange_rate: "1.00",
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        try {
            setLoading(true);
            const data = await CurrencyService.getCurrencies();
            setCurrencies(data);
        } catch (error) {
            console.error("Failed to fetch currencies:", error);
            toast.error(t("currencies.error_load"));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setFormData({
            name: "",
            code: "",
            symbol: "",
            exchange_rate: "1.00",
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (currency: Currency) => {
        setSelectedCurrency(currency);
        setFormData({
            name: currency.name,
            code: currency.code,
            symbol: currency.symbol,
            exchange_rate: Number(currency.exchange_rate).toFixed(2),
        });
        setIsEditModalOpen(true);
    };

    const handleOpenDeleteModal = (currency: Currency) => {
        if (currency.is_default) {
            toast.error(t("currencies.error_delete_default"), {
                description: t("currencies.error_delete_default_desc")
            });
            return;
        }
        setSelectedCurrency(currency);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await CurrencyService.createCurrency(formData);
            toast.success(t("currencies.success_add"));
            setIsAddModalOpen(false);
            fetchCurrencies();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to add currency";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCurrency) return;
        try {
            setSubmitting(true);
            await CurrencyService.updateCurrency(selectedCurrency.id, formData);
            toast.success(t("currencies.success_update"));
            setIsEditModalOpen(false);
            fetchCurrencies();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to update currency";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCurrency) return;
        try {
            setSubmitting(true);
            await CurrencyService.deleteCurrency(selectedCurrency.id);
            toast.success(t("currencies.success_delete"), {
                description: `${selectedCurrency.name} (${selectedCurrency.code}) ${t("common.removed")}.`
            });
            setIsDeleteModalOpen(false);
            fetchCurrencies();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to delete currency";
            toast.error(message);
        } finally {
            setSubmitting(false);
            setSelectedCurrency(null);
        }
    };

    const filteredCurrencies = currencies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full p-4 md:p-6 space-y-8 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">{t("currencies.title")}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("currencies.subtitle")}</p>
                    </div>
                </div>
                <Button
                    onClick={handleOpenAddModal}
                    className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 h-11 md:h-12 flex items-center"
                >
                    <Plus className="h-5 w-5" />
                    <span className="font-bold tracking-tight">{t("currencies.add_btn")}</span>
                </Button>
            </div>

            {/* Stats/Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <ArrowUpDown size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{t("currencies.total")}</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{currencies.length}</p>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-6 backdrop-blur-sm flex items-center">
                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <DollarSign size={18} className="text-emerald-500" />
                        <p>{t("currencies.manage_desc")}</p>
                    </div>
                </div>
            </div>

            {/* List/Table Section */}
            <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <Input
                            placeholder={t("currencies.search_placeholder")}
                            className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 border-transparent focus:border-indigo-500 rounded-2xl transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-zinc-500 gap-4">
                        <Loader2 className="animate-spin text-indigo-500" size={40} />
                        <p className="font-medium animate-pulse">{t("currencies.loading")}</p>
                    </div>
                ) : filteredCurrencies.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                                    <TableHead className="w-[100px] pl-8">{t("currencies.symbol")}</TableHead>
                                    <TableHead>{t("currencies.currency")}</TableHead>
                                    <TableHead>{t("currencies.code")}</TableHead>
                                    <TableHead className="text-right">{t("currencies.rate")}</TableHead>
                                    <TableHead className="text-right pr-8">{t("currencies.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCurrencies.map((currency) => (
                                    <TableRow key={currency.id} className="group hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors border-zinc-100 dark:border-zinc-800">
                                        <TableCell className="pl-8">
                                            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-lg text-zinc-900 dark:text-zinc-100">
                                                {currency.symbol}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-zinc-900 dark:text-zinc-100 italic">{currency.name}</TableCell>
                                        <TableCell>
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-black tracking-wider text-zinc-600 dark:text-zinc-400 uppercase">
                                                {currency.code}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            {Number(currency.exchange_rate).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-2 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEditModal(currency)}
                                                    className="h-8 w-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30"
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenDeleteModal(currency)}
                                                    className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="p-20 flex flex-col items-center justify-center text-zinc-400 gap-4">
                        <div className="h-16 w-16 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center">
                            <DollarSign size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{t("currencies.no_found")}</p>
                            <p className="text-sm">{t("currencies.no_found_desc")}</p>
                        </div>
                        <Button
                            onClick={handleOpenAddModal}
                            variant="outline"
                            className="mt-2 rounded-xl"
                        >
                            {t("currencies.add_btn")}
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <AlertDialogContent className="max-w-md rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
                    <div className="p-6 pt-8 text-center">
                        <div className="h-20 w-20 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Trash2 size={40} />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white leading-none">
                            {t("currencies.delete_title")}<br /><span className="text-rose-600">{t("currencies.delete_subtitle")}</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="mt-4 text-zinc-500 dark:text-zinc-400 font-medium">
                            {t("currencies.delete_desc")} <span className="font-black text-slate-900 dark:text-white italic">{selectedCurrency?.name} ({selectedCurrency?.code})</span>?
                            {t("currencies.delete_warning")}
                        </AlertDialogDescription>
                    </div>
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
                        <AlertDialogCancel
                            className="flex-1 h-12 rounded-2xl border-zinc-200 dark:border-zinc-700 font-bold uppercase tracking-widest text-[10px]"
                            disabled={submitting}
                        >
                            {t("currencies.cancel_delete")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-rose-600/20 transition-all border-0"
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="animate-spin mr-2" size={14} /> : <Trash2 className="mr-2" size={14} />}
                            {t("currencies.confirm_delete")}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add Currency Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Plus size={20} />
                            {t("currencies.add_title")}
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            {t("currencies.add_desc")}
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleCreate}>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("currencies.name_label")}</label>
                                <Input
                                    placeholder="e.g. US Dollar"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("currencies.iso_label")}</label>
                                    <Input
                                        placeholder="USD"
                                        required
                                        maxLength={10}
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-black uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("currencies.symbol_label")}</label>
                                    <Input
                                        placeholder="$"
                                        required
                                        value={formData.symbol}
                                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold text-center"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("currencies.rate_label")}</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.exchange_rate}
                                    onChange={e => setFormData({ ...formData, exchange_rate: e.target.value })}
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-mono font-bold"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-full px-6 font-bold"
                            >
                                {t("common.discard")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                {submitting ? t("currencies.adding") : t("currencies.add_btn")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Pencil size={20} />
                            {t("currencies.edit_title")}
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            {t("currencies.edit_desc")} <span className="font-bold underline italic">{selectedCurrency?.name}</span>.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleUpdate}>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("currencies.name_label")}</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("currencies.iso_label")}</label>
                                    <Input
                                        required
                                        maxLength={10}
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-black uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("currencies.symbol_label")}</label>
                                    <Input
                                        required
                                        value={formData.symbol}
                                        onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold text-center"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("currencies.rate_label")}</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.exchange_rate}
                                    onChange={e => setFormData({ ...formData, exchange_rate: e.target.value })}
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-mono font-bold"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsEditModalOpen(false)}
                                className="rounded-full px-6 font-bold"
                            >
                                {t("common.discard")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <DollarSign size={18} />}
                                {submitting ? t("currencies.updating") : t("currencies.edit_title")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

