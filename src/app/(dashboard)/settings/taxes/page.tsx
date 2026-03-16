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

const COLOR_MAP = {
    indigo: {
        bg: "from-indigo-500 to-blue-500",
        icon: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500",
        text: "text-indigo-600 dark:text-indigo-400",
    },
    emerald: {
        bg: "from-emerald-400 to-teal-500",
        icon: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
    },
    amber: {
        bg: "from-amber-400 to-orange-500",
        icon: "bg-amber-50 dark:bg-amber-900/20 text-amber-500",
        text: "text-amber-600 dark:text-amber-400",
    },
};

function SummaryCard({
    label,
    value,
    icon: Icon,
    color,
    description,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    color: keyof typeof COLOR_MAP;
    description: string;
}) {
    const c = COLOR_MAP[color];
    return (
        <Card className="bg-white dark:bg-zinc-900/60 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-lg p-6 flex flex-col gap-4 hover:shadow-xl transition-all group">
            <div className="flex items-center gap-4">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500", c.icon)}>
                    <Icon size={24} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-widest mb-1 truncate">
                        {label}
                    </p>
                    <p className={cn("text-xl font-black truncate", c.text)}>{value}</p>
                </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
                {description}
            </p>
        </Card>
    );
}

export default function TaxesPage() {
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
                    <p className="text-zinc-500 font-bold text-sm tracking-tight">Syncing tax records...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform rotate-3 transition-transform hover:rotate-0">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-400 bg-clip-text text-transparent tracking-tighter uppercase italic leading-none mb-2">
                            Tax Management
                        </h2>
                        <p className="text-xs md:text-base text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            Manage multi-jurisdictional tax compliance and registry entries.
                        </p>
                    </div>
                </div>

                <Link href="/settings/taxes/new">
                    <Button className="bg-gradient-to-r from-indigo-500 via-blue-600 to-blue-500 text-white rounded-full px-8 h-14 shadow-lg shadow-indigo-500/25 font-black uppercase italic tracking-tighter transition-all hover:scale-[1.02] active:scale-95 border-0 whitespace-nowrap text-base gap-3">
                        <Plus size={20} strokeWidth={3} /> Add Tax Rate
                    </Button>
                </Link>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    label="Compliance Ready"
                    value="Presets Enabled"
                    icon={ShieldCheck}
                    color="indigo"
                    description="Automated provincial tax presets (GST, PST, HST) for Canadian reporting."
                />
                <SummaryCard
                    label="Liability Tracking"
                    value="Real-time Sync"
                    icon={Scale}
                    color="emerald"
                    description="Direct accumulation of tax payable across all commercial transactions."
                />
                <SummaryCard
                    label="CRA Registration"
                    value="Secure Ledger"
                    icon={ArrowUpRight}
                    color="amber"
                    description="Digital management of business registration numbers (BN/NE) for PDF export."
                />
            </div>

            {/* ── Search & Filters ── */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-zinc-900/50 p-2 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                    <Input
                        placeholder="Search tax labels or registration IDs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none py-7 pl-16 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium w-full"
                    />
                </div>
                <Button variant="ghost" className="h-12 w-12 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all mr-2">
                    <Filter size={22} />
                </Button>
            </div>

            {/* ── Table View ── */}
            <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-400" />

                <div className="overflow-x-auto mt-1.5">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/80">
                            <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest pl-10 py-5">Tax Identifier</TableHead>
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest py-5">Territory</TableHead>
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest py-5">Valuation</TableHead>
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest py-5">Scope</TableHead>
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest py-5">Registration</TableHead>
                                <TableHead className="text-zinc-500 font-black text-[10px] uppercase tracking-widest text-right pr-10 py-5">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            <AnimatePresence mode="popLayout">
                                {filteredTaxes.map((tax, index) => (
                                    <motion.tr
                                        layout
                                        key={tax.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                        className="border-zinc-100 dark:border-zinc-800 group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <TableCell className="py-6 pl-10">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-500 shrink-0 group-hover:scale-110 transition-transform">
                                                    <Percent size={18} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-lg leading-tight">{tax.name}</p>
                                                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.15em] mt-1">ID: INT-{tax.id.toString().padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                                <span className="text-zinc-600 dark:text-zinc-300 font-bold">{tax.province || "Federal"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">
                                                {tax.type === 'percentage' ? `${tax.rate}%` : `$${parseFloat(tax.rate).toFixed(2)}`}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className={cn(
                                                "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                tax.tax_category === 'both' ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30" :
                                                    tax.tax_category === 'sales' ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" :
                                                        "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30"
                                            )}>
                                                {tax.tax_category}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                {tax.tax_number || "U/S REG"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-10">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 text-zinc-400 hover:text-indigo-600 shadow-sm border border-zinc-100 dark:border-zinc-700">
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 text-zinc-400 hover:text-rose-600 shadow-sm border border-zinc-100 dark:border-zinc-700">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>

                            {filteredTaxes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="h-20 w-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                                <Info size={40} className="text-indigo-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">No Records Found</h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mx-auto font-medium">
                                                    We couldn't find any tax profiles matching your query.
                                                </p>
                                            </div>
                                            <Link href="/settings/taxes/new">
                                                <Button className="rounded-full bg-indigo-600 text-white font-bold h-12 px-8">
                                                    Add New Entry
                                                </Button>
                                            </Link>
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
                    Secure Fiscal Ledger
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    v2.1.0 • Canadian Regulatory Compliance Module
                </p>
            </div>
        </div>
    );
}
