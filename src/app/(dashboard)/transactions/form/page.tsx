"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionService, TransactionType, PaymentMethod, TransactionStatus } from "@/lib/transaction-service";
import { CategoryService, Category } from "@/lib/category-service";
import { ContactService, Contact } from "@/lib/contact-service";
import { AccountService } from "@/lib/accounting-import-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Receipt,
    ArrowLeft,
    Loader2,
    Save,
    Tag,
    User,
    Calendar,
    CreditCard,
    FileText,
    Hash,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/TranslationContext";

function TransactionFormContent() {
    const router = useRouter();
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const isEdit = !!editId;

    const { currentCompany } = useAuthStore();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [categories, setCategories] = useState<Category[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);

    const TYPES: { value: TransactionType; label: string, emoji: string }[] = [
        { value: "income", label: t('transactions.type_income'), emoji: "💰" },
        { value: "expense", label: t('transactions.type_expense'), emoji: "💸" },
        { value: "sales", label: t('transactions.type_sales'), emoji: "🛒" },
        { value: "purchase", label: t('transactions.type_purchase'), emoji: "📦" },
        { value: "transfer", label: t('transactions.type_transfer'), emoji: "🔄" },
        { value: "tax", label: t('transactions.type_tax'), emoji: "🧾" },
        { value: "shipping", label: t('transactions.type_shipping'), emoji: "🚚" },
    ];

    const PAYMENT_METHODS: { value: PaymentMethod; label: string, emoji: string }[] = [
        { value: "cash", label: t('transactions.payment_cash'), emoji: "💵" },
        { value: "bank", label: t('transactions.payment_bank'), emoji: "🏦" },
        { value: "online", label: t('transactions.payment_online'), emoji: "💳" },
    ];

    const STATUSES: { value: TransactionStatus; label: string; color: string }[] = [
        { value: "completed", label: t('transactions.status_completed'), color: "from-emerald-500 to-green-600" },
        { value: "pending", label: t('transactions.status_pending'), color: "from-amber-500 to-yellow-600" },
        { value: "cancelled", label: t('transactions.status_cancelled'), color: "from-rose-500 to-red-600" },
    ];

    const [form, setForm] = useState({
        type: (searchParams.get("type") as TransactionType) || ("expense" as TransactionType),
        amount: "",
        date: new Date().toISOString().split("T")[0],
        payment_method: "cash" as PaymentMethod,
        status: "completed" as TransactionStatus,
        category_id: "",
        contact_id: "",
        description: "",
        reference_number: t('transactions.field_reference_manual') || "Manual",
        tax_id: "",
        account_id: "",
    });

    useEffect(() => {
        if (!currentCompany) return;

        const loadDependencies = async () => {
            try {
                const [cats, contcts, accs] = await Promise.all([
                    CategoryService.getAll(currentCompany.id),
                    ContactService.getAll(currentCompany.id),
                    AccountService.getAll(currentCompany.id),
                ]);
                setCategories(cats);
                setContacts(contcts);
                setAccounts(accs);

                const cashAcc = accs.find((a: any) => a.name.toUpperCase() === 'CASH');
                if (cashAcc && !isEdit) {
                    setForm(prev => ({ ...prev, account_id: cashAcc.id.toString() }));
                }
            } catch (error) {
                console.error("Failed to load dependencies", error);
            }
        };
        loadDependencies().catch(console.error);

        if (isEdit) {
            TransactionService.getById(Number(editId))
                .then((tx) => {
                    setForm({
                        type: tx.type,
                        amount: String(tx.amount),
                        date: tx.date.split("T")[0],
                        payment_method: tx.payment_method,
                        status: tx.status,
                        category_id: tx.category_id ? String(tx.category_id) : "",
                        contact_id: tx.contact_id ? String(tx.contact_id) : "",
                        description: tx.description || "",
                        reference_number: tx.reference_number || "",
                        tax_id: tx.tax_id ? String(tx.tax_id) : "",
                        account_id: tx.account_id ? String(tx.account_id) : "",
                    });
                })
                .catch(() => toast.error(t('transactions.error_save') || "Failed to load transaction"))
                .finally(() => setLoading(false));
        }
    }, [currentCompany, editId, isEdit, t]);

    const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCompany) return;
        if (!form.amount || isNaN(Number(form.amount))) {
            toast.error(t('transactions.error_invalid_amount') || "Please enter a valid amount");
            return;
        }

        setSubmitting(true);
        const payload = {
            company_id: currentCompany.id,
            type: form.type,
            amount: parseFloat(form.amount),
            date: form.date,
            payment_method: form.payment_method,
            status: form.status,
            category_id: form.category_id ? Number(form.category_id) : undefined,
            contact_id: form.contact_id ? Number(form.contact_id) : undefined,
            description: form.description || undefined,
            reference_number: form.reference_number || undefined,
            account_id: form.account_id ? Number(form.account_id) : undefined,
        };

        try {
            if (isEdit) {
                await TransactionService.update(Number(editId), payload);
                toast.success(t('transactions.success_update') || "Transaction updated successfully");
            } else {
                await TransactionService.create(payload);
                toast.success(t('transactions.success_create') || "Transaction recorded successfully");
            }
            router.push("/transactions");
        } catch {
            toast.error(t('transactions.error_save') || "Failed to save transaction");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const isIncome = ["income", "sales"].includes(form.type);

    return (
        <div className="w-full p-4 md:p-6 animate-in fade-in duration-700 pb-20">
            {/* Back */}
            <button
                onClick={() => router.push("/transactions")}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold mb-8 transition-colors group"
            >
                <span className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                    <ArrowLeft size={16} className="group-hover:text-emerald-600" />
                </span>
                {t('transactions.back_to_list')}
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                    <Receipt size={26} />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 bg-clip-text text-transparent tracking-tighter uppercase italic leading-none">
                        {isEdit ? t('transactions.edit_title') : t('transactions.new_title')}
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                        {isEdit ? t('transactions.edit_subtitle') : t('transactions.new_subtitle')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Transaction Type Selector */}
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-lg p-6 md:p-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">{t('transactions.section_type')}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                        {TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => set("type", type.value)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 font-bold text-xs transition-all ${form.type === type.value
                                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 scale-105 shadow-md"
                                    : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600"
                                    }`}
                            >
                                <span className="text-xl">{type.emoji}</span>
                                <span className="uppercase tracking-wider text-[9px]">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Fields */}
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-lg p-6 md:p-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6">{t('transactions.section_details')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Amount */}
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                                {t('transactions.field_amount')} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-zinc-400">
                                    {currentCompany?.currency || "$"}
                                </span>
                                <Input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={(e) => set("amount", e.target.value)}
                                    className={`pl-12 h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-black text-lg ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <Calendar size={11} /> {t('transactions.field_date')} <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                required
                                type="date"
                                value={form.date}
                                onChange={(e) => set("date", e.target.value)}
                                className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-semibold"
                            />
                        </div>

                        {/* Reference */}
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <Hash size={11} /> {t('transactions.field_reference')}
                            </Label>
                            <Input
                                placeholder="INV-2024-001"
                                value={form.reference_number}
                                onChange={(e) => set("reference_number", e.target.value)}
                                className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 font-mono"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <Tag size={11} /> {t('transactions.field_category')}
                            </Label>
                            <select
                                value={form.category_id}
                                onChange={(e) => set("category_id", e.target.value)}
                                className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold px-3 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">— {t('transactions.select_category')} —</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Contact */}
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <User size={11} /> {t('transactions.field_contact')}
                            </Label>
                            <select
                                value={form.contact_id}
                                onChange={(e) => set("contact_id", e.target.value)}
                                className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold px-3 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">— {t('transactions.select_contact')} —</option>
                                {contacts.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <CreditCard size={11} /> {t('transactions.field_payment_method')} <span className="text-red-500">*</span>
                            </Label>
                            <select
                                required
                                value={form.payment_method}
                                onChange={(e) => set("payment_method", (e.target.value as PaymentMethod))}
                                className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold px-3 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {PAYMENT_METHODS.map((pm) => (
                                    <option key={pm.value} value={pm.value}>{pm.emoji} {pm.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Account */}
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                                <CreditCard size={11} /> {t('transactions.field_account')} <span className="text-red-500">*</span>
                            </Label>
                            <select
                                required
                                value={form.account_id}
                                onChange={(e) => set("account_id", e.target.value)}
                                className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold px-3 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">— {t('transactions.select_account')} —</option>
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-5 space-y-2">
                        <Label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                            <FileText size={11} /> {t('transactions.field_description')}
                        </Label>
                        <textarea
                            rows={3}
                            placeholder={t('transactions.field_description')}
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium px-4 py-3 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="bg-white dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-lg p-6 md:p-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">{t('transactions.section_status')}</h3>
                    <div className="flex flex-wrap gap-3">
                        {STATUSES.map((status) => (
                            <button
                                key={status.value}
                                type="button"
                                onClick={() => set("status", status.value)}
                                className={`flex items-center gap-2 px-6 h-12 rounded-full border-2 font-bold text-sm transition-all ${form.status === status.value
                                    ? `bg-gradient-to-r ${status.color} text-white border-transparent shadow-md scale-105`
                                    : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400"
                                    }`}
                            >
                                <span className={`h-2 w-2 rounded-full ${form.status === status.value ? "bg-white" : "bg-zinc-400"}`} />
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/transactions")}
                        className="h-12 px-8 rounded-full font-bold border-zinc-300 dark:border-zinc-700"
                    >
                        {t('common.cancel') || "Cancel"}
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="h-12 px-10 rounded-full font-black uppercase italic tracking-tighter bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 text-white border-0 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {isEdit ? t('transactions.update_transaction') : t('transactions.save_transaction')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function TransactionFormPage() {
    return (
        <Suspense fallback={<div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
            <TransactionFormContent />
        </Suspense>
    );
}
