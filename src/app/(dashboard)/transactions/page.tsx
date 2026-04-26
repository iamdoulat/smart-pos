"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TransactionService, Transaction } from "@/lib/transaction-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Receipt,
    PlusSquare,
    Search,
    ArrowUpCircle,
    ArrowDownCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    Loader2,
    TrendingUp,
    TrendingDown,
    DollarSign,
} from "lucide-react";
import { toast } from "sonner";
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

const TYPE_LABELS: Record<string, string> = {
    income: "Income",
    expense: "Expense",
    transfer: "Transfer",
    sales: "Sales",
    purchase: "Purchase",
    tax: "Tax",
    shipping: "Shipping",
};

const PAYMENT_LABELS: Record<string, string> = {
    cash: "Cash",
    bank: "Bank",
    online: "Online",
};

export default function TransactionsPage() {
    const router = useRouter();
    const { currentCompany } = useAuthStore();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const loadTransactions = async () => {
        if (!currentCompany) return;
        try {
            setLoading(true);
            const data = await TransactionService.getAll(currentCompany.id);
            setTransactions(data);
        } catch {
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [currentCompany]);

    const handleDelete = async (id: number) => {
        try {
            await TransactionService.delete(id);
            toast.success("Transaction deleted");
            loadTransactions();
        } catch {
            toast.error("Failed to delete transaction");
        }
    };

    const filtered = transactions.filter((tx) => {
        const matchSearch =
            tx.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = typeFilter === "all" || tx.type === typeFilter;
        const matchStatus = statusFilter === "all" || tx.status === statusFilter;
        return matchSearch && matchType && matchStatus;
    });

    const totalIncome = transactions
        .filter((t) => ["income", "sales"].includes(t.type) && t.status !== "cancelled")
        .reduce((s, t) => s + parseFloat(String(t.amount)), 0);

    const totalExpense = transactions
        .filter((t) => ["expense", "purchase"].includes(t.type) && t.status !== "cancelled")
        .reduce((s, t) => s + parseFloat(String(t.amount)), 0);

    const netBalance = totalIncome - totalExpense;
    const currency = currentCompany?.currency || "USD";

    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

    return (
        <div className="w-full space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20 px-8 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 transform rotate-3 transition-transform hover:rotate-0">
                        <Receipt size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 bg-clip-text text-transparent tracking-tight uppercase pr-4 leading-tight mb-1">
                            Transactions
                        </h2>
                        <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 font-semibold tracking-tight">
                            Track all your income and expenses in one place.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <Input
                            placeholder="Search by category, contact, ref..."
                            className="pl-12 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => router.push("/transactions/form")}
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 text-white rounded-full px-8 h-12 shadow-lg shadow-emerald-500/25 font-bold uppercase tracking-tight transition-all hover:scale-[1.02] active:scale-95 border-0"
                    >
                        <PlusSquare className="mr-2 h-5 w-5" /> Add Transaction
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Income */}
                <div className="bg-white dark:bg-zinc-900/60 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-lg p-6 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <TrendingUp size={28} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-1">Total Income</p>
                        <p className="text-2xl font-bold text-emerald-500">{currency} {fmt(totalIncome)}</p>
                    </div>
                </div>
                {/* Expense */}
                <div className="bg-white dark:bg-zinc-900/60 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-lg p-6 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                        <TrendingDown size={28} className="text-rose-500" />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-1">Total Expenses</p>
                        <p className="text-2xl font-bold text-rose-500">{currency} {fmt(totalExpense)}</p>
                    </div>
                </div>
                {/* Net */}
                <div className="bg-white dark:bg-zinc-900/60 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-lg p-6 flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${netBalance >= 0 ? "bg-teal-500/10" : "bg-orange-500/10"}`}>
                        <DollarSign size={28} className={netBalance >= 0 ? "text-teal-500" : "text-orange-500"} />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mb-1">Net Balance</p>
                        <p className={`text-2xl font-black ${netBalance >= 0 ? "text-teal-500" : "text-orange-500"}`}>
                            {netBalance >= 0 ? "+" : ""}{currency} {fmt(Math.abs(netBalance))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 h-10 shadow-sm">
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Type:</span>
                    {["all", "income", "expense", "sales", "purchase", "transfer"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTypeFilter(t)}
                            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${typeFilter === t
                                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                }`}
                        >
                            {t === "all" ? "All" : TYPE_LABELS[t]}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 h-10 shadow-sm">
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Status:</span>
                    {["all", "completed", "pending", "cancelled"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${statusFilter === s
                                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                }`}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                    <div className="h-2 absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500" />
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 uppercase font-black tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {filtered.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-6 py-4 text-xs text-zinc-500 font-medium whitespace-nowrap">
                                            {new Date(tx.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400">
                                                {tx.reference_number || "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                {tx.category?.name || "Uncategorized"}
                                            </span>
                                            {tx.description && (
                                                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{tx.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                            {tx.contact?.name || "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {["income", "sales"].includes(tx.type) ? (
                                                    <ArrowUpCircle size={14} className="text-emerald-500 shrink-0" />
                                                ) : (
                                                    <ArrowDownCircle size={14} className="text-rose-500 shrink-0" />
                                                )}
                                                <span className={`text-xs font-bold uppercase tracking-wide ${["income", "sales"].includes(tx.type) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                    {TYPE_LABELS[tx.type] || tx.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                                                {PAYMENT_LABELS[tx.payment_method] || tx.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-black text-base ${["income", "sales"].includes(tx.type) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                                                {["income", "sales"].includes(tx.type) ? "+" : "-"}{currency} {fmt(parseFloat(String(tx.amount)))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => router.push(`/transactions/form?id=${tx.id}`)}
                                                    className="h-8 w-8 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 flex items-center justify-center hover:scale-110 transition-transform"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button className="h-8 w-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:scale-110 transition-transform">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden">
                                                        <div className="bg-red-500 p-8 text-white">
                                                            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                                                                <Trash2 size={32} />
                                                            </div>
                                                            <AlertDialogTitle className="text-2xl font-bold tracking-tight uppercase leading-none">Delete Transaction?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-red-50 mt-2 font-medium">
                                                                This will permanently delete the {TYPE_LABELS[tx.type]} of <span className="font-bold underline">{currency} {fmt(parseFloat(String(tx.amount)))}</span>.
                                                            </AlertDialogDescription>
                                                        </div>
                                                        <AlertDialogFooter className="p-6 bg-white dark:bg-zinc-950 gap-3">
                                                            <AlertDialogCancel className="rounded-full border-zinc-200 dark:border-zinc-800 font-bold px-8 h-12">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(tx.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-10 h-12 shadow-lg shadow-red-500/20 border-0">
                                                                Confirm Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 mb-6">
                                                    <Receipt size={40} />
                                                </div>
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">No transactions found</h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mt-2 font-medium leading-relaxed">
                                                    {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                                                        ? "Try adjusting your filters or search query."
                                                        : "Start recording your income and expenses by clicking 'Add Transaction'."}
                                                </p>
                                                {!searchTerm && typeFilter === "all" && statusFilter === "all" && (
                                                    <Button
                                                        onClick={() => router.push("/transactions/form")}
                                                        className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 px-8 font-bold shadow-lg shadow-emerald-500/20"
                                                    >
                                                        <PlusSquare className="mr-2 h-5 w-5" /> Add Transaction
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length > 0 && (
                        <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <span className="text-xs text-zinc-400 font-medium">
                                Showing {filtered.length} of {transactions.length} transactions
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "completed":
            return (
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={10} /> Completed
                </span>
            );
        case "pending":
            return (
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                    <Clock size={10} /> Pending
                </span>
            );
        case "cancelled":
            return (
                <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                    <XCircle size={10} /> Cancelled
                </span>
            );
        default:
            return <span className="text-xs text-zinc-400">{status}</span>;
    }
}
