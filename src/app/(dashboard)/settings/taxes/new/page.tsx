"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TaxService } from "@/lib/tax-bank-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowLeft,
    Save,
    Sparkles,
    Loader2,
    Info,
    Zap,
    ShieldAlert,
    BadgeCheck,
    Network,
    BarChart3
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const provinces = [
    { code: "AB", name: "Alberta" },
    { code: "BC", name: "British Columbia" },
    { code: "MB", name: "Manitoba" },
    { code: "NB", name: "New Brunswick" },
    { code: "NL", name: "Newfoundland and Labrador" },
    { code: "NS", name: "Nova Scotia" },
    { code: "NT", name: "Northwest Territories" },
    { code: "NU", name: "Nunavut" },
    { code: "ON", name: "Ontario" },
    { code: "PE", name: "Prince Edward Island" },
    { code: "QC", name: "Quebec" },
    { code: "SK", name: "Saskatchewan" },
    { code: "YT", name: "Yukon" },
];

export default function NewTaxPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [presets, setPresets] = useState<any>(null);
    const [selectedProvince, setSelectedProvince] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        rate: "",
        type: "percentage",
        tax_category: "both",
        tax_number: "",
        province: "",
        company_id: 1,
    });

    useEffect(() => {
        async function loadPresets() {
            try {
                const data = await TaxService.getPresets();
                setPresets(data);
            } catch (error) {
                console.error("Failed to load presets", error);
            }
        }
        loadPresets();
    }, []);

    const handleProvinceChange = (provinceCode: string) => {
        if (provinceCode === "none") {
            setSelectedProvince("");
            setFormData(prev => ({ ...prev, province: "" }));
            return;
        }

        setSelectedProvince(provinceCode);
        setFormData(prev => ({ ...prev, province: provinceCode }));

        if (presets && presets[provinceCode]) {
            const provinceTaxes = presets[provinceCode];
            if (provinceTaxes.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    name: provinceTaxes.map((t: any) => t.name).join(" + "),
                    rate: provinceTaxes.reduce((sum: number, t: any) => sum + t.rate, 0).toString(),
                    province: provinceCode
                }));
                toast.success(
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Sparkles size={16} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-sm">Presets Synchronized</span>
                            <span className="text-[10px] opacity-70 font-mono tracking-tighter capitalize">{provinceCode} Standard Rates: {provinceTaxes.map((t: any) => `${t.name} ${t.rate}%`).join(" + ")}</span>
                        </div>
                    </div>,
                    { style: { background: "#18181b", border: "1px solid #27272a", color: "#fff" } }
                );
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Cast rate to float and sanitize data before sending
        const payload = {
            ...formData,
            rate: parseFloat(formData.rate) || 0,
            province: formData.province || null,
            tax_number: formData.tax_number || null,
        };

        try {
            await TaxService.create(payload);
            toast.success("Tax registry updated successfully");
            router.push("/settings/taxes");
        } catch (error: any) {
            console.error("Failed to create tax", error);
            // Extract validation error messages if available
            if (error?.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstErrors = Object.values(errors).flat();
                toast.error((firstErrors[0] as string) || "Validation failed");
            } else if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Registry update failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 pb-32"
        >
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-zinc-900/60 p-6 md:p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <Link href="/settings/taxes">
                        <Button variant="ghost" className="h-14 w-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-600 flex items-center justify-center transition-all shadow-inner border border-zinc-200 dark:border-zinc-700">
                            <ArrowLeft size={24} strokeWidth={3} />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform -rotate-3 transition-transform hover:rotate-0">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-400 bg-clip-text text-transparent tracking-tighter uppercase italic leading-none mb-1">
                                Provision Tax Rate
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Add New Registry Entry</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/settings/taxes">
                        <Button variant="ghost" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl px-8 h-14 transition-all">
                            Discard
                        </Button>
                    </Link>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-indigo-500 via-blue-600 to-blue-500 text-white rounded-full px-10 h-14 shadow-lg shadow-indigo-500/25 font-black uppercase italic tracking-tighter transition-all hover:scale-[1.02] active:scale-95 border-0 flex items-center gap-3 text-base"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={20} strokeWidth={3} />}
                        {loading ? "Syncing..." : "Finalize Profile"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-12">
                {/* ── Form Section ── */}
                <div className="md:col-span-8 space-y-8">
                    <Card className="bg-white dark:bg-zinc-900/60 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
                        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-400" />
                        <CardHeader className="p-10 pb-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-500">
                                    <Zap size={20} strokeWidth={2.5} />
                                </div>
                                <CardTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tighter uppercase">Core Definition</CardTitle>
                            </div>
                            <CardDescription className="text-zinc-500 font-bold pl-14">Configure the structural properties of your tax identifier.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-6 space-y-10">
                            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                <div className="group space-y-4">
                                    <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] pl-1 transition-colors group-focus-within:text-indigo-500">Tax Nomenclature</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="GST, QST, Sales Tax..."
                                        className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-lg font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all pl-6"
                                    />
                                </div>
                                <div className="group space-y-4">
                                    <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] pl-1 transition-colors group-focus-within:text-indigo-500">Numerical Magnitude</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.rate}
                                            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                                            placeholder="0.00"
                                            className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-2xl font-black text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all pl-14 shadow-inner"
                                        />
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-xl">
                                            {formData.type === 'percentage' ? "%" : "$"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-4">
                                    <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] pl-1">Computational Engine</Label>
                                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-6 shadow-inner focus:ring-4 focus:ring-indigo-500/10 transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl shadow-2xl p-2">
                                            <SelectItem value="percentage" className="rounded-xl h-12 focus:bg-indigo-600 focus:text-white font-bold mb-1 italic">Percentage Calculation (%)</SelectItem>
                                            <SelectItem value="fixed" className="rounded-xl h-12 focus:bg-indigo-600 focus:text-white font-bold italic">Fixed Currency Value ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] pl-1">Commercial Scope</Label>
                                    <Select value={formData.tax_category} onValueChange={(v) => setFormData({ ...formData, tax_category: v })}>
                                        <SelectTrigger className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-6 shadow-inner focus:ring-4 focus:ring-indigo-500/10 transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl shadow-2xl p-2">
                                            <SelectItem value="both" className="rounded-xl h-12 focus:bg-indigo-600 focus:text-white font-bold mb-1">Omni-Channel (Global)</SelectItem>
                                            <SelectItem value="sales" className="rounded-xl h-12 focus:bg-indigo-600 focus:text-white font-bold mb-1">Inbound Revenue Only</SelectItem>
                                            <SelectItem value="purchase" className="rounded-xl h-12 focus:bg-indigo-600 focus:text-white font-bold">Outbound Expense Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900/60 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
                        <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />
                        <CardHeader className="p-10 pb-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-500">
                                    <Network size={20} strokeWidth={2.5} />
                                </div>
                                <CardTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tighter uppercase">Legal Nexus</CardTitle>
                            </div>
                            <CardDescription className="text-zinc-500 font-bold pl-14">Map this identifier to a legal jurisdiction for fiscal reporting.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-6 space-y-10">
                            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-4">
                                    <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] pl-1">Jurisdiction / Province</Label>
                                    <Select value={formData.province || "none"} onValueChange={handleProvinceChange}>
                                        <SelectTrigger className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-6 shadow-inner focus:ring-4 focus:ring-indigo-500/10 transition-all">
                                            <SelectValue placeholder="Locate territory..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl shadow-2xl h-80 p-2">
                                            <SelectItem value="none" className="rounded-xl h-12 focus:bg-zinc-100 dark:focus:bg-zinc-800 font-medium italic opacity-50 mb-2">Unspecified Nexus</SelectItem>
                                            {provinces.map(p => (
                                                <SelectItem key={p.code} value={p.code} className="rounded-xl h-12 focus:bg-indigo-600 focus:text-white font-black text-xs uppercase tracking-widest mb-1">
                                                    {p.name} <span className="text-[9px] ml-2 font-mono bg-zinc-100 dark:bg-white/10 px-2 py-0.5 rounded-lg opacity-60 text-zinc-500 dark:text-zinc-300">{p.code}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="group space-y-4">
                                    <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] pl-1 transition-colors group-focus-within:text-amber-500">Legal Registry Identifier</Label>
                                    <Input
                                        value={formData.tax_number}
                                        onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                                        placeholder="BN / NE Number..."
                                        className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-lg font-black font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all pl-6 uppercase tracking-wider"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Sidebar Section ── */}
                <div className="md:col-span-4 space-y-8">
                    <Card className="border-none bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-800 rounded-[3rem] shadow-3xl shadow-indigo-600/20 overflow-hidden relative group p-1">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                            <BadgeCheck size={140} className="text-white" strokeWidth={1} />
                        </div>
                        <CardHeader className="p-10 pb-6 relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.25em] mb-4 backdrop-blur-md border border-white/10">
                                <Sparkles size={12} className="fill-white" />
                                Live Validation
                            </div>
                            <CardTitle className="text-4xl font-black text-white italic tracking-tighter leading-[0.85] uppercase">
                                Provisioning <br /> Engine
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-10 pb-10 relative z-10 space-y-8">
                            <p className="text-indigo-50 text-sm font-bold leading-relaxed opacity-80">
                                Territorial presets are verified against current Canadian fiscal standards.
                            </p>
                            <div className="space-y-3">
                                {[
                                    { l: "Ontario", v: "13% HST" },
                                    { l: "Quebec", v: "GST + QST" },
                                    { l: "Western", v: "GST + PST" }
                                ].map((row, i) => (
                                    <div key={i} className="flex justify-between items-center bg-black/20 py-4 px-5 rounded-2xl border border-white/5 backdrop-blur-sm group-hover:bg-black/30 transition-all">
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{row.l}</span>
                                        <span className="text-sm font-black text-white italic tracking-tight">{row.v}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-zinc-900/40 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-xl">
                        <CardContent className="p-8 space-y-8">
                            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                                <ShieldAlert size={18} className="text-rose-500" />
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em]">Fiscal Integrity</span>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="h-5 w-1 rounded-full bg-indigo-500 mt-0.5 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">Registry identifiers are immutable once associated with finalized invoices.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-5 w-1 rounded-full bg-amber-500 mt-0.5 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed italic">Territorial nexuses ensure automated selection on multi-currency sales.</p>
                                </div>
                            </div>
                            <div className="pt-4">
                                <div className="bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 text-zinc-400 dark:text-zinc-700">
                                    <Info size={16} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">CRA-Ready Cloud Architecture</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="pt-10 flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                    Provisioning Terminal
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    v2.1.0 • Secure Ledger Interface
                </p>
            </div>
        </motion.div>
    );
}
