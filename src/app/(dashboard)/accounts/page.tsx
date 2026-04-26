"use client";

import { useEffect, useState, useCallback } from "react";
import { AccountService } from "@/lib/accounting-import-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Plus,
    BookOpen,
    ChevronRight,
    Landmark,
    Receipt,
    TrendingUp,
    PiggyBank,
    Wallet,
    Search,
    Filter,
    Trash2,
    Loader2,
    Sparkles,
    BarChart3,
    Info,
    Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ── Type config ──────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: React.ElementType; iconBg: string; iconText: string; gradient: string; badgeBg: string; badgeText: string }> = {
    asset: {
        icon: PiggyBank,
        iconBg: "bg-white/20",
        iconText: "text-white",
        gradient: "from-emerald-500 via-teal-500 to-emerald-600",
        badgeBg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-900/30",
        badgeText: "text-emerald-600 dark:text-emerald-400",
    },
    liability: {
        icon: Landmark,
        iconBg: "bg-white/20",
        iconText: "text-white",
        gradient: "from-rose-500 via-pink-500 to-rose-600",
        badgeBg: "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-900/30",
        badgeText: "text-rose-600 dark:text-rose-400",
    },
    equity: {
        icon: Wallet,
        iconBg: "bg-white/20",
        iconText: "text-white",
        gradient: "from-indigo-600 via-blue-600 to-indigo-700",
        badgeBg: "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-900/30",
        badgeText: "text-indigo-600 dark:text-indigo-400",
    },
    revenue: {
        icon: TrendingUp,
        iconBg: "bg-white/20",
        iconText: "text-white",
        gradient: "from-amber-400 via-orange-500 to-amber-600",
        badgeBg: "bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-900/30",
        badgeText: "text-amber-600 dark:text-amber-400",
    },
    expense: {
        icon: Receipt,
        iconBg: "bg-white/20",
        iconText: "text-white",
        gradient: "from-zinc-600 via-zinc-700 to-zinc-800",
        badgeBg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
        badgeText: "text-zinc-600 dark:text-zinc-400",
    },
};

const ACCOUNT_TYPES = ["asset", "liability", "equity", "revenue", "expense"] as const;

// ── Summary Card ─────────────────────────────────────────────
function SummaryCard({ type, count, isSelected, onClick }: { type: string; count: number; isSelected: boolean; onClick: () => void }) {
    const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.expense;
    const Icon = cfg.icon;
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left rounded-xl border shadow-xl p-6 flex flex-col gap-4 hover:scale-[1.02] active:scale-95 transition-all group cursor-pointer relative overflow-hidden",
                isSelected
                    ? "ring-4 ring-indigo-500/20 border-white/50"
                    : "border-transparent",
                "bg-gradient-to-br",
                cfg.gradient
            )}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:scale-150" />

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em]">{type}</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter">
                        {count} <span className="text-xs text-white/60 font-black uppercase tracking-widest ml-1">Items</span>
                    </h3>
                </div>
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md", cfg.iconBg, cfg.iconText)}>
                    <Icon size={20} strokeWidth={3} />
                </div>
            </div>

            <div className="flex items-center gap-2 relative z-10">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest leading-none">
                    {count > 0 ? "Active Accounts" : "No Accounts yet"}
                </p>
            </div>
        </button>
    );
}

// ── New Account Dialog ────────────────────────────────────────
function NewAccountDialog({ open, onClose, onCreated, companyId }: { open: boolean; onClose: () => void; onCreated: () => void; companyId: number }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ code: "", name: "", type: "asset", parent_id: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await AccountService.create({ ...form, company_id: companyId, parent_id: form.parent_id || null });
            toast.success("Account created successfully");
            onCreated();
            onClose();
            setForm({ code: "", name: "", type: "asset", parent_id: "" });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-0 overflow-hidden max-w-lg">
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase">New Account</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Account Code</Label>
                                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. 1010" required className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-zinc-100" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Type</Label>
                                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                    <SelectTrigger className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-2">
                                        {ACCOUNT_TYPES.map(t => (
                                            <SelectItem key={t} value={t} className="rounded-xl h-10 font-bold capitalize focus:bg-indigo-600 focus:text-white">{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Account Name</Label>
                            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cash and Cash Equivalents" required className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium" />
                        </div>
                        <DialogFooter className="gap-4 pt-2">
                            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-12 px-8 font-black text-xs uppercase tracking-[0.15em] text-zinc-500">Cancel</Button>
                            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl h-12 px-8 font-black uppercase tracking-tighter shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={3} />}
                                {loading ? "Creating..." : "Create Account"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ChartOfAccountsPage() {
    const { currentCompany } = useAuthStore();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [showNewDialog, setShowNewDialog] = useState(false);

    const loadAccounts = useCallback(async () => {
        if (!currentCompany) return;
        try {
            const data = await AccountService.getAll(currentCompany.id);
            setAccounts(data);
        } catch (error) {
            console.error("Failed to load accounts", error);
        } finally {
            setLoading(false);
        }
    }, [currentCompany]);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const handleInitializeCOA = async () => {
        if (!currentCompany) return;
        setInitializing(true);
        try {
            const result = await AccountService.initializeCOA(currentCompany.id);
            toast.success(`Chart of Accounts initialized with ${result.count} accounts`);
            await loadAccounts();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Initialization failed");
        } finally {
            setInitializing(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await AccountService.delete(id);
            toast.success("Account deleted");
            setAccounts(prev => prev.filter(a => a.id !== id));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Cannot delete this account");
        }
    };

    const filtered = accounts.filter(a => {
        const matchType = !selectedType || a.type === selectedType;
        const matchSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchType && matchSearch;
    });

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                    <p className="text-zinc-500 font-bold text-sm tracking-tight">Loading chart of accounts...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-4 md:pt-0 pt-0 md:px-8 md:pb-8 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 transform rotate-3 hover:rotate-0 transition-transform">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 bg-clip-text text-transparent tracking-tighter uppercase leading-none mb-1">
                            Chart of Accounts
                        </h2>
                        <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            Manage your general ledger and financial structure.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                        <Input
                            placeholder="Search accounts..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm"
                        />
                    </div>
                    <Button
                        onClick={() => setShowNewDialog(true)}
                        className="bg-gradient-to-r from-emerald-500 via-teal-500 to-teal-400 text-white rounded-xl px-6 h-12 shadow-lg shadow-emerald-500/25 font-black uppercase tracking-tighter transition-all hover:scale-[1.02] active:scale-95 border-0 whitespace-nowrap text-sm gap-2"
                    >
                        <Plus size={18} strokeWidth={3} /> New Account
                    </Button>
                </div>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ACCOUNT_TYPES.map(type => (
                    <SummaryCard
                        key={type}
                        type={type}
                        count={accounts.filter(a => a.type === type).length}
                        isSelected={selectedType === type}
                        onClick={() => setSelectedType(prev => prev === type ? null : type)}
                    />
                ))}
            </div>


            {/* ── Table ── */}
            <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/80">
                            <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest pl-10 py-5 w-[120px]">Code</TableHead>
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest py-5">Account Name</TableHead>
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest py-5">Type</TableHead>
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest py-5">Status</TableHead>
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest text-right pr-10 py-5">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((account, index) => {
                                    const cfg = TYPE_CONFIG[account.type] ?? TYPE_CONFIG.expense;
                                    const Icon = cfg.icon;
                                    return (
                                        <motion.tr
                                            layout
                                            key={account.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.03, duration: 0.25 }}
                                            className="border-zinc-100 dark:border-zinc-800 group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <TableCell className="py-5 pl-10">
                                                <span className="font-mono text-sm font-black text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                                    {account.code}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", cfg.iconBg, cfg.iconText)}>
                                                        <Icon size={16} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                                                            {account.parent_id && <ChevronRight size={12} className="inline text-zinc-400 mr-1" />}
                                                            {account.name}
                                                        </p>
                                                        {account.parent && (
                                                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-0.5">
                                                                Under: {account.parent.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className={cn("inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border capitalize", cfg.badgeBg, cfg.badgeText)}>
                                                    {account.type}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("h-2 w-2 rounded-full", account.is_active !== false ? "bg-emerald-500 animate-pulse" : "bg-zinc-400")} />
                                                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                                        {account.is_active !== false ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-10 py-5">
                                                <div className="flex justify-end gap-2 transition-all duration-300">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 text-zinc-400 hover:text-indigo-600 shadow-sm border border-zinc-100 dark:border-zinc-700">
                                                        <Edit2 size={15} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(account.id)}
                                                        className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 text-zinc-400 hover:text-rose-600 shadow-sm border border-zinc-100 dark:border-zinc-700"
                                                    >
                                                        <Trash2 size={15} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>

                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="h-20 w-20 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                                <BookOpen size={40} className="text-emerald-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                                                    {accounts.length === 0 ? "No Accounts Found" : "No Matching Accounts"}
                                                </h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mx-auto font-medium">
                                                    {accounts.length === 0
                                                        ? "Import a default Chart of Accounts to get started quickly."
                                                        : "Try adjusting your search or filter."}
                                                </p>
                                            </div>
                                            {accounts.length === 0 && (
                                                <Button
                                                    onClick={handleInitializeCOA}
                                                    disabled={initializing}
                                                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black h-14 px-10 shadow-lg shadow-emerald-500/20 uppercase tracking-tight gap-3"
                                                >
                                                    {initializing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                                    {initializing ? "Initializing..." : "Initialize COA"}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="pt-10 flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                    General Ledger Module
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    v2.1.0 • GAAP / IFRS Compliant Structure
                </p>
            </div>

            {/* ── New Account Dialog ── */}
            {currentCompany && (
                <NewAccountDialog
                    open={showNewDialog}
                    onClose={() => setShowNewDialog(false)}
                    onCreated={loadAccounts}
                    companyId={currentCompany.id}
                />
            )}
        </div>
    );
}
