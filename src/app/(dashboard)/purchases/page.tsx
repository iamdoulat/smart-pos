"use client";

import { useEffect, useState } from "react";
import { PurchaseService } from "@/lib/sales-purchase-service";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag, ArrowDownRight, Search, FileText } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/TranslationContext";
import { useAuthStore } from "@/lib/store";

export default function PurchasesPage() {
    const { t } = useTranslation();
    const { currentCompany } = useAuthStore();
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPurchases() {
            if (!currentCompany) return;
            try {
                const data = await PurchaseService.getAll(currentCompany.id);
                setPurchases(data);
            } catch (error) {
                console.error("Failed to load purchases", error);
            } finally {
                setLoading(false);
            }
        }
        loadPurchases();
    }, [currentCompany]);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-[1.5rem] bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 relative group transition-all duration-500 hover:scale-105">
                        <ShoppingBag size={24} strokeWidth={2.5} className="relative z-10" />
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-400 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter uppercase leading-none">
                            {t('purchases.title')}
                        </h1>
                        <p className="text-[9px] md:text-[11px] text-zinc-500 dark:text-zinc-400 font-black tracking-[0.2em] uppercase opacity-70">
                            {t('purchases.subtitle')}
                        </p>
                    </div>
                </div>

                <Link href="/transactions/form?type=purchase" className="w-full sm:w-auto">
                    <Button className="w-full rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-[10px] uppercase tracking-widest px-10 shadow-xl shadow-orange-500/20 border-0 h-11 transition-all hover:scale-[1.02] active:scale-95">
                        <Plus className="mr-2 h-5 w-5" /> {t('purchases.record_bill')}
                    </Button>
                </Link>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard
                    label={t('purchases.total_purchases')}
                    value={`${currentCompany?.currency || "$"}${purchases.reduce((acc, p) => acc + parseFloat(p.amount), 0).toFixed(2)}`}
                    icon={ArrowDownRight}
                    gradient="from-rose-500 via-rose-600 to-orange-700"
                    shadow="shadow-rose-500/30"
                />
                <SummaryCard
                    label={t('purchases.bills_recorded')}
                    value={purchases.length.toString()}
                    icon={ShoppingBag}
                    gradient="from-blue-500 via-blue-600 to-indigo-700"
                    shadow="shadow-blue-500/30"
                />
                <SummaryCard
                    label={t('purchases.avg_bill_amount')}
                    value={`${currentCompany?.currency || "$"}${(purchases.length > 0 ? purchases.reduce((acc, p) => acc + parseFloat(p.amount), 0) / purchases.length : 0).toFixed(2)}`}
                    icon={FileText}
                    gradient="from-amber-400 via-orange-500 to-rose-600"
                    shadow="shadow-orange-500/30"
                />
            </div>

            <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                        <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800">
                            <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('purchases.table_bill_no')}</TableHead>
                            <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('purchases.table_vendor')}</TableHead>
                            <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('purchases.table_category')}</TableHead>
                            <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">{t('purchases.table_date')}</TableHead>
                            <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">{t('purchases.table_amount')}</TableHead>
                            <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">{t('inventory.table_action') || "Actions"}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {purchases.map((purchase) => (
                            <TableRow key={purchase.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group border-zinc-100 dark:border-zinc-800">
                                <TableCell className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                                    BIL-{purchase.id.toString().padStart(4, '0')}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-medium">{purchase.contact?.name || "-"}</TableCell>
                                <TableCell className="px-6 py-4">
                                    <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                        {purchase.category?.name || t('purchases.general_expense')}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-zinc-400 font-medium">
                                    {new Date(purchase.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right text-rose-500 font-black text-base">
                                    {currentCompany?.currency || "$"}{parseFloat(purchase.amount).toFixed(2)}
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-500 transition-all">
                                        <FileText size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}

                        {purchases.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 mb-6">
                                            <ShoppingBag size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('purchases.no_records')}</h3>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon: Icon, gradient, shadow }: any) {
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

