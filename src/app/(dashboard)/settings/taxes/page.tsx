"use client";

import { useEffect, useState } from "react";
import { TaxService } from "@/lib/tax-bank-service";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Percent,
    ShieldCheck,
    Scale,
    Info,
    Edit2,
    Trash2,
    Search,
    Filter,
    ArrowUpRight,
    Loader2,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/TranslationContext";

const COLOR_MAP = {
    blue: {
        bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
        iconBg: "bg-white/20",
        shadow: "shadow-blue-500/30",
    },
    emerald: {
        bg: "bg-gradient-to-br from-emerald-400 to-teal-600",
        iconBg: "bg-white/20",
        shadow: "shadow-emerald-500/30",
    },
    purple: {
        bg: "bg-gradient-to-br from-purple-500 to-indigo-600",
        iconBg: "bg-white/20",
        shadow: "shadow-purple-500/30",
    },
    orange: {
        bg: "bg-gradient-to-br from-orange-500 to-rose-600",
        iconBg: "bg-white/20",
        shadow: "shadow-orange-500/30",
    },
};

function SummaryCard({
    label,
    value,
    icon: Icon,
    color,
    trend,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    color: keyof typeof COLOR_MAP;
    trend: string;
}) {
    const c = COLOR_MAP[color];
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className={cn(
                "relative overflow-hidden border-0 rounded-[32px] p-6 text-white shadow-2xl transition-all duration-500 group h-full",
                c.bg,
                c.shadow
            )}>
                {/* Decorative background circle */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
                
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[13px] font-medium text-white/80 tracking-wide">
                                {label}
                            </p>
                            <h3 className="text-3xl font-black tracking-tight">
                                {value}
                            </h3>
                        </div>
                        <div className={cn(
                            "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform duration-500",
                            c.iconBg
                        )}>
                            <Icon size={28} className="text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-bold text-white/90 bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <ArrowUpRight size={14} strokeWidth={3} />
                        <span>{trend}</span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

export default function TaxesPage() {
    const { t } = useTranslation();
    const [taxes, setTaxes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const companyId = 1;

    useEffect(() => {
        async function loadTaxes() {
            try {
                const data = await TaxService.getAll(companyId);
                setTaxes(data);
            } catch (error) {
                console.error("Failed to load taxes", error);
            } finally {
                setLoading(false);
            }
        }
        loadTaxes();
    }, [companyId]);

    const filteredTaxes = taxes.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.province && t.province.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.tax_number && t.tax_number.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                    <p className="text-zinc-500 font-bold text-sm tracking-tight">{t('taxes.syncing')}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">{t("taxes.title")}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("taxes.subtitle")}</p>
                    </div>
                </div>
                <Link href="/settings/taxes/new">
                    <Button
                        className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-6 gap-2 shadow-lg shadow-orange-500/20 py-6"
                    >
                        <Plus size={18} />
                        <span className="font-bold">{t("taxes.add_tax")}</span>
                    </Button>
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    label={t("taxes.card_compliance")}
                    value={t("taxes.card_compliance_value")}
                    icon={ShieldCheck}
                    color="blue"
                    trend={`+12.5% ${t("dashboard.vs_last_month")}`}
                />
                <SummaryCard
                    label={t("taxes.card_liability")}
                    value={t("taxes.card_liability_value")}
                    icon={Scale}
                    color="emerald"
                    trend={`+4.2% ${t("dashboard.vs_last_month")}`}
                />
                <SummaryCard
                    label={t("taxes.card_registration")}
                    value={t("taxes.card_registration_value")}
                    icon={ArrowUpRight}
                    color="purple"
                    trend={t("dashboard.steady_this_month")}
                />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <Input
                        placeholder={t("taxes.search_placeholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-amber-500"
                    />
                </div>
            </div>

            {/* Taxes Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("taxes.table_identifier")}</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("taxes.table_territory")}</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("taxes.table_valuation")}</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("taxes.table_scope")}</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">{t("taxes.table_registration")}</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">{t("common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {filteredTaxes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        {t("taxes.no_records")}
                                    </td>
                                </tr>
                            ) : (
                                filteredTaxes.map((tax) => (
                                    <tr key={tax.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                    <Percent size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tax.name}</p>
                                                    <p className="text-[10px] text-zinc-400 font-medium">ID: INT-{tax.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                            {tax.province || t("taxes.federal")}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                            {tax.type === "percentage" ? `${tax.rate}%` : `$${parseFloat(tax.rate).toFixed(2)}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-bold tracking-tight uppercase",
                                                tax.tax_category === "both" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" :
                                                    tax.tax_category === "sales" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            )}>
                                                {tax.tax_category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-zinc-500">
                                            {tax.tax_number || "U/S REG"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                    <Edit2 size={14} className="text-indigo-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
