"use client";

import { useEffect, useState, useCallback } from "react";
import { BankService } from "@/lib/tax-bank-service";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Banknote,
    CreditCard,
    Wallet,
    ArrowUpRight,
    RefreshCw,
    Trash2,
    Loader2,
    Search,
    Building2,
    PiggyBank,
    DollarSign,
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/axios";

import { useTranslation } from "@/i18n/TranslationContext";

// ── Types ─────────────────────────────────────────────────────
const ACCOUNT_TYPES = ["Checking", "Savings", "Credit Card", "Cash", "Other"] as const;

const TYPE_ICON: Record<string, React.ElementType> = {
    "Checking": CreditCard,
    "Savings": PiggyBank,
    "Credit Card": CreditCard,
    "Cash": DollarSign,
    "Other": Wallet,
};

const TYPE_COLOR = [
    { icon: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500", gradient: "from-indigo-500 to-blue-500" },
    { icon: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500", gradient: "from-emerald-500 to-teal-500" },
    { icon: "bg-violet-50 dark:bg-violet-900/20 text-violet-500", gradient: "from-violet-500 to-purple-500" },
    { icon: "bg-amber-50 dark:bg-amber-900/20 text-amber-500", gradient: "from-amber-400 to-orange-500" },
];

// ── Bank Account Card ─────────────────────────────────────────
function BankAccountCard({ account, index, onDelete, t }: { account: any; index: number; onDelete: (id: number) => void; t: any }) {
    const colorSet = TYPE_COLOR[index % TYPE_COLOR.length];
    const Icon = TYPE_ICON[account.account_type] ?? CreditCard;
    const balance = parseFloat(account.current_balance ?? 0);
    const isNegative = balance < 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
            className="group bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all overflow-hidden relative"
        >


            {/* Watermark icon */}
            <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={80} />
            </div>

            <div className="p-8 pt-10 space-y-6 relative z-10">
                {/* Top row */}
                <div className="flex items-start justify-between">
                    <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500", colorSet.icon)}>
                        <Icon size={28} strokeWidth={2} />
                    </div>
                    <div className={cn("inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700")}>
                        {account.account_type || t('bank.default_type')}
                    </div>
                </div>

                {/* Info */}
                <div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">{account.bank_name}</h3>
                    <p className="text-xs font-mono text-zinc-400 mt-1 tracking-widest">
                        {account.account_number ? `•••• •••• ${account.account_number.slice(-4)}` : "•••• •••• ••••"}
                    </p>
                </div>

                {/* Balance */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">{t('bank.current_balance')}</p>
                    <p className={cn("text-3xl font-black mt-1 tracking-tighter", isNegative ? "text-rose-500" : "text-zinc-900 dark:text-zinc-100")}>
                        {isNegative ? "-" : ""}${Math.abs(balance).toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button variant="ghost" size="sm" className="flex-1 rounded-xl h-10 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 border border-zinc-100 dark:border-zinc-700 text-xs font-black uppercase tracking-widest">
                        <RefreshCw size={14} className="mr-2" /> {t('bank.reconcile')}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(account.id)}
                        className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-rose-600 border border-zinc-100 dark:border-zinc-700"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

// ── New Bank Account Dialog ────────────────────────────────────
function NewBankDialog({ open, onClose, onCreated, companyId, t }: { open: boolean; onClose: () => void; onCreated: () => void; companyId: number; t: any }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ bank_name: "", account_number: "", account_type: "Checking", initial_balance: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await BankService.create({
                ...form,
                company_id: companyId,
                initial_balance: parseFloat(form.initial_balance) || 0,
            });
            toast.success(t('bank.account_linked_success'));
            onCreated();
            onClose();
            setForm({ bank_name: "", account_number: "", account_type: "Checking", initial_balance: "" });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('bank.failed_to_link'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-0 overflow-hidden max-w-lg">
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase">{t('bank.dialog_title')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">{t('bank.label_bank_name')}</Label>
                            <Input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder={t('bank.bank_name_placeholder')} required className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">{t('bank.label_account_number')}</Label>
                                <Input value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} placeholder={t('bank.account_number_placeholder')} className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">{t('bank.label_account_type')}</Label>
                                <Select value={form.account_type} onValueChange={v => setForm({ ...form, account_type: v })}>
                                    <SelectTrigger className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-2">
                                        {ACCOUNT_TYPES.map(t_type => (
                                            <SelectItem key={t_type} value={t_type} className="rounded-xl h-10 font-bold focus:bg-indigo-600 focus:text-white">{t_type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">{t('bank.label_opening_balance')} ($)</Label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-xl">$</span>
                                <Input type="number" step="0.01" value={form.initial_balance} onChange={e => setForm({ ...form, initial_balance: e.target.value })} placeholder="0.00" className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-black text-xl pl-12" />
                            </div>
                        </div>
                        <DialogFooter className="gap-4 pt-2">
                            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-12 px-8 font-black text-xs uppercase tracking-[0.15em] text-zinc-500">{t('common.cancel')}</Button>
                            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl h-12 px-8 font-black uppercase tracking-tighter shadow-lg shadow-blue-500/20 flex items-center gap-2">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={3} />}
                                {loading ? t('bank.linking') : t('bank.link_account_btn')}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Summary Stat Card ─────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, description }: {
    label: string; value: string; icon: React.ElementType;
    color: string; description: string;
}) {
    const gradientClasses: any = {
        blue: "bg-gradient-to-r from-[#2B5BFF] to-[#5138EE]",
        indigo: "bg-gradient-to-r from-[#2B5BFF] to-[#5138EE]",
        emerald: "bg-gradient-to-r from-[#00D09E] to-[#019DA3]",
    };

    return (
        <div className={cn("rounded-xl overflow-hidden text-white transition-all duration-300 shadow-xl hover:-translate-y-1 relative group w-full", gradientClasses[color])}>
            <div className="p-5 flex flex-col justify-center h-[120px]">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[15px] uppercase font-bold tracking-wider text-white/90 drop-shadow-sm">{label}</p>
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

// ── Main Page ─────────────────────────────────────────────────
export default function BankPage() {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewDialog, setShowNewDialog] = useState(false);
    const companyId = 1;

    const loadAccounts = useCallback(async () => {
        try {
            const data = await BankService.getAll(companyId);
            setAccounts(data);
        } catch (error) {
            console.error("Failed to load bank accounts", error);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/bank-accounts/${id}`);
            toast.success(t('bank.account_removed_success'));
            setAccounts(prev => prev.filter(a => a.id !== id));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || t('bank.failed_to_remove'));
        }
    };

    const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.current_balance ?? 0), 0);
    const positiveAccounts = accounts.filter(a => parseFloat(a.current_balance ?? 0) >= 0);
    const totalAccounts = accounts.length;

    const filtered = accounts.filter(a =>
        !searchQuery ||
        a.bank_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.account_number?.includes(searchQuery)
    );

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <p className="text-zinc-500 font-bold text-sm tracking-tight">{t('bank.loading_accounts')}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6 space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-[1.5rem] bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 relative group transition-all duration-500 hover:scale-105">
                        <Building2 size={24} strokeWidth={2.5} className="relative z-10" />
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-400 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter uppercase leading-tight pt-[5px]">
                            {t('bank.title')}
                        </h1>
                        <p className="text-[9px] md:text-[11px] text-zinc-500 dark:text-zinc-400 font-black tracking-[0.2em] uppercase opacity-70">
                            {t('bank.desc')}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button
                        variant="ghost"
                        className="w-full sm:w-auto h-12 rounded-full px-6 border border-zinc-200 dark:border-zinc-700 font-black text-[10px] uppercase tracking-widest text-zinc-500 hover:text-blue-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all gap-2"
                    >
                        <RefreshCw size={14} /> {t('bank.reconcile')}
                    </Button>
                    <Button
                        onClick={() => setShowNewDialog(true)}
                        className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full px-10 h-12 shadow-xl shadow-orange-500/20 font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95 border-0"
                    >
                        <Plus size={18} strokeWidth={3} className="mr-2" /> {t('bank.link_account')}
                    </Button>
                </div>
            </div>

            {/* ── Summary Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label={t('bank.total_liquidity')}
                    value={`$${totalBalance.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    color="blue"
                    description={t('bank.total_liquidity_desc')}
                />
                <StatCard
                    label={t('bank.linked_accounts')}
                    value={`${totalAccounts}`}
                    icon={CreditCard}
                    color="indigo"
                    description={t('bank.linked_accounts_desc')}
                />
                <StatCard
                    label={t('bank.active_accounts')}
                    value={`${positiveAccounts.length}`}
                    icon={ArrowUpRight}
                    color="emerald"
                    description={t('bank.active_accounts_desc')}
                />
            </div>

            {/* ── Search ── */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/50 p-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    <Input
                        placeholder={t('bank.search_placeholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none py-7 pl-16 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium"
                    />
                </div>
            </div>

            {/* ── Cards Grid ── */}
            {filtered.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((account, index) => (
                            <BankAccountCard key={account.id} account={account} index={index} onDelete={handleDelete} t={t} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col items-center gap-6 py-24">
                        <div className="h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Banknote size={40} className="text-blue-400" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                                {accounts.length === 0 ? t('bank.no_accounts') : t('bank.no_matching')}
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mx-auto font-medium">
                                {accounts.length === 0
                                    ? t('bank.no_accounts_desc')
                                    : t('bank.no_matching_desc')}
                            </p>
                        </div>
                        {accounts.length === 0 && (
                            <Button
                                onClick={() => setShowNewDialog(true)}
                                className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black h-14 px-10 shadow-lg shadow-blue-500/20 uppercase tracking-tight gap-3"
                            >
                                <Plus size={18} strokeWidth={3} /> {t('bank.link_first_account')}
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Footer ── */}
            <div className="pt-10 flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                    {t('bank.footer_title')}
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    {t('bank.footer_version')}
                </p>
            </div>

            {/* ── Dialog ── */}
            <NewBankDialog
                open={showNewDialog}
                onClose={() => setShowNewDialog(false)}
                onCreated={loadAccounts}
                companyId={companyId}
                t={t}
            />
        </div>
    );
}
