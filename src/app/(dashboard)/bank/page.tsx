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
function BankAccountCard({ account, index, onDelete }: { account: any; index: number; onDelete: (id: number) => void }) {
    const colorSet = TYPE_COLOR[index % TYPE_COLOR.length];
    const Icon = TYPE_ICON[account.account_type] ?? CreditCard;
    const balance = parseFloat(account.current_balance ?? 0);
    const isNegative = balance < 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
            className="group bg-white dark:bg-zinc-900/60 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all overflow-hidden relative"
        >
            {/* Gradient accent bar */}
            <div className={cn("h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r", colorSet.gradient)} />

            {/* Watermark icon */}
            <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={80} />
            </div>

            <div className="p-8 pt-10 space-y-6 relative z-10">
                {/* Top row */}
                <div className="flex items-start justify-between">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500", colorSet.icon)}>
                        <Icon size={28} strokeWidth={2} />
                    </div>
                    <div className={cn("inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700")}>
                        {account.account_type || "Checking"}
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
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">Current Balance</p>
                    <p className={cn("text-3xl font-black mt-1 tracking-tighter italic", isNegative ? "text-rose-500" : "text-zinc-900 dark:text-zinc-100")}>
                        {isNegative ? "-" : ""}${Math.abs(balance).toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button variant="ghost" size="sm" className="flex-1 rounded-2xl h-10 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 border border-zinc-100 dark:border-zinc-700 text-xs font-black uppercase tracking-widest">
                        <RefreshCw size={14} className="mr-2" /> Reconcile
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(account.id)}
                        className="h-10 w-10 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-rose-600 border border-zinc-100 dark:border-zinc-700"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

// ── New Bank Account Dialog ────────────────────────────────────
function NewBankDialog({ open, onClose, onCreated, companyId }: { open: boolean; onClose: () => void; onCreated: () => void; companyId: number }) {
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
            toast.success("Bank account linked successfully");
            onCreated();
            onClose();
            setForm({ bank_name: "", account_number: "", account_type: "Checking", initial_balance: "" });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to link account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-0 overflow-hidden max-w-lg">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-400" />
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tighter uppercase">Link Bank Account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Bank / Institution Name</Label>
                            <Input value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. RBC Royal Bank" required className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Account Number</Label>
                                <Input value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} placeholder="Last 4 digits..." className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Account Type</Label>
                                <Select value={form.account_type} onValueChange={v => setForm({ ...form, account_type: v })}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-2xl p-2">
                                        {ACCOUNT_TYPES.map(t => (
                                            <SelectItem key={t} value={t} className="rounded-xl h-10 font-bold focus:bg-indigo-600 focus:text-white">{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Opening Balance ($)</Label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-xl">$</span>
                                <Input type="number" step="0.01" value={form.initial_balance} onChange={e => setForm({ ...form, initial_balance: e.target.value })} placeholder="0.00" className="h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-black text-xl pl-12" />
                            </div>
                        </div>
                        <DialogFooter className="gap-4 pt-2">
                            <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-[0.15em] text-zinc-500">Cancel</Button>
                            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full h-12 px-8 font-black uppercase italic tracking-tight shadow-lg shadow-blue-500/20 flex items-center gap-2">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={3} />}
                                {loading ? "Linking..." : "Link Account"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Summary Stat Card ─────────────────────────────────────────
function StatCard({ label, value, icon: Icon, gradient, shadow, description }: {
    label: string; value: string; icon: React.ElementType;
    gradient: string; shadow: string; description: string;
}) {
    return (
        <div className={cn(
            "relative rounded-[2.5rem] p-7 flex flex-col gap-4 overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group",
            "bg-gradient-to-br shadow-xl", gradient, shadow
        )}>
            {/* Decorative Glass Blobs */}
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -top-12 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

            <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-1.5">
                    <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.25em]">{label}</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{value}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 border border-white/30 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                    <Icon size={26} className="text-white" />
                </div>
            </div>

            <div className="relative z-10 pt-2 border-t border-white/10">
                <p className="text-[11px] text-white/80 font-bold leading-relaxed max-w-[90%]">
                    {description}
                </p>
            </div>

            {/* Subtle Shine Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function BankPage() {
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
            toast.success("Bank account removed");
            setAccounts(prev => prev.filter(a => a.id !== id));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to remove account");
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
                    <p className="text-zinc-500 font-bold text-sm tracking-tight">Loading bank accounts...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 md:pt-4 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transform rotate-3 hover:rotate-0 transition-transform">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-400 bg-clip-text text-transparent tracking-tighter uppercase italic leading-none mb-2">
                            Bank &amp; Payments
                        </h2>
                        <p className="text-xs md:text-base text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            Manage your financial accounts and liquid assets.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="h-14 rounded-full px-8 border border-zinc-200 dark:border-zinc-700 font-black text-xs uppercase tracking-[0.15em] text-zinc-500 hover:text-blue-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all gap-3"
                    >
                        <RefreshCw size={16} /> Reconcile
                    </Button>
                    <Button
                        onClick={() => setShowNewDialog(true)}
                        className="bg-gradient-to-r from-blue-500 via-indigo-600 to-indigo-500 text-white rounded-full px-8 h-14 shadow-lg shadow-blue-500/25 font-black uppercase italic tracking-tighter transition-all hover:scale-[1.02] active:scale-95 border-0 whitespace-nowrap text-base gap-3"
                    >
                        <Plus size={20} strokeWidth={3} /> Link Account
                    </Button>
                </div>
            </div>

            {/* ── Summary Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Liquidity"
                    value={`$${totalBalance.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    gradient="from-blue-600 via-indigo-600 to-blue-500"
                    shadow="shadow-blue-500/30"
                    description="Combined balance across all linked financial accounts."
                />
                <StatCard
                    label="Linked Accounts"
                    value={`${totalAccounts} Account${totalAccounts !== 1 ? "s" : ""}`}
                    icon={CreditCard}
                    gradient="from-indigo-600 via-violet-600 to-purple-500"
                    shadow="shadow-violet-500/30"
                    description="Financial institutions connected to this company profile."
                />
                <StatCard
                    label="Active Accounts"
                    value={`${positiveAccounts.length} Healthy`}
                    icon={ArrowUpRight}
                    gradient="from-emerald-500 via-teal-600 to-cyan-500"
                    shadow="shadow-emerald-500/30"
                    description="Accounts with a positive or zero balance — financially healthy."
                />
            </div>

            {/* ── Search ── */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    <Input
                        placeholder="Search by bank name or account number..."
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
                            <BankAccountCard key={account.id} account={account} index={index} onDelete={handleDelete} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
                    <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-400" />
                    <div className="flex flex-col items-center gap-6 py-24 mt-1.5">
                        <div className="h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Banknote size={40} className="text-blue-400" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                                {accounts.length === 0 ? "No Accounts Linked" : "No Matching Accounts"}
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mx-auto font-medium">
                                {accounts.length === 0
                                    ? "Connect your first bank account to start tracking balances."
                                    : "Try a different search term."}
                            </p>
                        </div>
                        {accounts.length === 0 && (
                            <Button
                                onClick={() => setShowNewDialog(true)}
                                className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black h-14 px-10 shadow-lg shadow-blue-500/20 uppercase italic tracking-tight gap-3"
                            >
                                <Plus size={18} strokeWidth={3} /> Link First Account
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Footer ── */}
            <div className="pt-10 flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                    Secure Banking Module
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    v2.1.0 • PCI DSS Compliant Architecture
                </p>
            </div>

            {/* ── Dialog ── */}
            <NewBankDialog
                open={showNewDialog}
                onClose={() => setShowNewDialog(false)}
                onCreated={loadAccounts}
                companyId={companyId}
            />
        </div>
    );
}
