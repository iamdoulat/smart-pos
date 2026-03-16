"use client"

import React, { useState, useEffect } from "react";
import {
    CreditCard,
    Plus,
    Search,
    Edit2,
    Trash2,
    Lock,
    Globe,
    Layers,
    X,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    Zap,
    CircleDollarSign,
    Banknote,
    Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PaymentService, PaymentConfiguration } from "@/lib/payment-service";
import { cn } from "@/lib/utils";

export default function PaymentSettingsPage() {
    const [configs, setConfigs] = useState<PaymentConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<PaymentConfiguration | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<PaymentConfiguration>>({
        name: "",
        provider: "cash",
        client_id: "",
        client_secret: "",
        is_live: false,
        is_active: true
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const data = await PaymentService.getConfigurations();
            setConfigs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch payment configs:", error);
            toast.error("Failed to load payment configurations");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setFormData({
            name: "",
            provider: "cash",
            client_id: "",
            client_secret: "",
            is_live: true,
            is_active: true
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (config: PaymentConfiguration) => {
        setSelectedConfig(config);
        setFormData({
            name: config.name,
            provider: config.provider as any,
            client_id: config.client_id,
            client_secret: "",
            is_live: config.is_live,
            is_active: config.is_active
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await PaymentService.createConfiguration(formData);
            toast.success("Payment method added successfully");
            setIsAddModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add payment method");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConfig) return;
        try {
            setSubmitting(true);
            const updateProps = { ...formData };
            if (!updateProps.client_secret) delete updateProps.client_secret;

            await PaymentService.updateConfiguration(selectedConfig.id, updateProps);
            toast.success("Configuration updated successfully");
            setIsEditModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update configuration");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this payment method?")) return;
        try {
            await PaymentService.deleteConfiguration(id);
            toast.success("Payment method deleted successfully");
            fetchConfigs();
        } catch (error: any) {
            toast.error("Failed to delete payment method");
        }
    };

    const filteredConfigs = configs.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (provider: string) => {
        switch (provider.toLowerCase()) {
            case 'cash': return <Banknote size={24} className="text-emerald-500" />;
            case 'card': return <CreditCard size={24} className="text-blue-500" />;
            case 'paypal': return <Coins size={24} className="text-indigo-500" />;
            case 'interac': return <Zap size={24} className="text-amber-500" />;
            default: return <Layers size={24} className="text-zinc-500" />;
        }
    };

    const getGradient = (provider: string) => {
        switch (provider.toLowerCase()) {
            case 'cash': return "from-emerald-400 to-teal-600";
            case 'card': return "from-blue-400 to-indigo-600";
            case 'paypal': return "from-indigo-400 to-purple-600";
            case 'interac': return "from-amber-400 to-orange-600";
            default: return "from-zinc-400 to-zinc-600";
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-[0_8px_30px_rgb(99,102,241,0.3)] transform rotate-3 transition-transform hover:rotate-0">
                        <CreditCard size={20} className="md:w-7 md:h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tighter uppercase italic py-1 leading-none">
                            Payment Gateway
                        </h2>
                        <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight uppercase tracking-widest mt-1 opacity-60">
                            Manage POS & Web Payment Methods
                        </p>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-3 md:gap-4">
                    <div className="relative group min-w-[140px] xs:min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <Input
                            placeholder="Filter methods..."
                            className="pl-12 pr-4 h-12 w-full sm:w-64 md:w-80 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-bold shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl px-4 md:px-8 gap-2 shadow-xl shadow-indigo-500/20 h-12 flex items-center justify-center whitespace-nowrap border-0 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                        <span className="font-black uppercase tracking-tighter italic">Add Method</span>
                    </Button>
                </div>
            </div>

            {/* List Section */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 rounded-[48px] bg-zinc-100 dark:bg-zinc-800 animate-pulse border-2 border-zinc-200 dark:border-zinc-700" />
                    ))}
                </div>
            ) : filteredConfigs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredConfigs.map(config => (
                        <div
                            key={config.id}
                            className={cn(
                                "group relative h-full bg-white dark:bg-zinc-900 rounded-[3rem] border-2 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 flex flex-col",
                                config.is_active ? "border-zinc-100 dark:border-zinc-800" : "border-red-100 dark:border-red-900/10 opacity-75 grayscale-[0.8]"
                            )}
                        >
                            <div className={cn(
                                "h-24 transition-all duration-700 group-hover:h-32 bg-gradient-to-br p-6",
                                getGradient(config.provider)
                            )} />

                            <div className="px-8 pb-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-start -mt-12 mb-6">
                                    <div className="h-24 w-24 rounded-[2rem] bg-white dark:bg-zinc-900 shadow-2xl border-4 border-white dark:border-zinc-900 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                                        {getIcon(config.provider)}
                                    </div>
                                    <div className="pt-14 flex flex-col items-end gap-2">
                                        <div className="flex gap-2">
                                            {config.is_live ? (
                                                <Badge className="rounded-full px-3 py-1 font-black bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20 text-[10px] uppercase">
                                                    LIVE
                                                </Badge>
                                            ) : (
                                                <Badge className="rounded-full px-3 py-1 font-black bg-amber-500 text-white border-0 shadow-lg shadow-amber-500/20 text-[10px] uppercase">
                                                    TEST
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter truncate uppercase italic">{config.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-0.5">{config.provider} Provider</p>
                                    </div>

                                    {config.client_id && (
                                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                            <span className="text-zinc-400 font-black uppercase text-[9px] tracking-widest block mb-1">Account / App ID</span>
                                            <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 break-all leading-tight">
                                                {config.client_id}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-8 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-6">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-2.5 w-2.5 rounded-full", config.is_active ? "bg-emerald-500 shadow-[0_0_10px_rgb(16,185,129,0.5)] animate-pulse" : "bg-zinc-300")} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{config.is_active ? 'ENABLED' : 'DISABLED'}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenEditModal(config)}
                                            className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(config.id)}
                                            className="h-9 w-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border-4 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[64px] p-24 flex flex-col items-center justify-center text-center">
                    <div className="h-24 w-24 rounded-[32px] bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-300 mb-8 transform rotate-12">
                        <Coins size={48} />
                    </div>
                    <h3 className="text-3xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100 mb-3 uppercase">Empty Vault</h3>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-sm mb-12 font-bold tracking-tight">Set up your payment methods to start accepting sales in Quebec.</p>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-indigo-600 text-white rounded-3xl px-12 h-16 font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 border-0"
                    >
                        INITIALIZE GATEWAY
                    </Button>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Dialog
                open={isAddModalOpen || isEditModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                    }
                }}
            >
                <DialogContent className="max-w-2xl w-[95vw] rounded-[3rem] p-0 overflow-hidden border-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] bg-white dark:bg-zinc-950">
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-10 text-white relative">
                        <Button
                            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                            className="absolute right-6 top-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 p-0 flex items-center justify-center backdrop-blur-md transition-all"
                        >
                            <X size={20} />
                        </Button>
                        <DialogTitle className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-3 uppercase italic leading-none">
                            {isAddModalOpen ? <Plus size={32} /> : <Edit2 size={32} />}
                            {isAddModalOpen ? 'Configure Method' : 'Modify Method'}
                        </DialogTitle>
                        <DialogDescription className="text-white/70 text-sm mt-3 font-bold uppercase tracking-widest opacity-80">
                            {isAddModalOpen
                                ? 'Enable a new payment option for your POS system.'
                                : `Editing configuration for: ${selectedConfig?.name}`
                            }
                        </DialogDescription>
                    </div>

                    <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate} className="bg-white dark:bg-zinc-950">
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                                {/* Provider Selection */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Payment Type</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { id: 'Cash', icon: Banknote, color: 'emerald' },
                                            { id: 'Card', icon: CreditCard, color: 'blue' },
                                            { id: 'PayPal', icon: Coins, color: 'indigo' },
                                            { id: 'Interac', icon: Zap, color: 'amber' },
                                        ].map(method => (
                                            <div
                                                key={method.id}
                                                onClick={() => setFormData({ ...formData, provider: method.id.toLowerCase() as any })}
                                                className={cn(
                                                    "p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 font-black text-[10px] uppercase tracking-widest group relative overflow-hidden",
                                                    formData.provider === method.id.toLowerCase()
                                                        ? `border-${method.color}-500 bg-${method.color}-50 dark:bg-${method.color}-950/20 text-${method.color}-700`
                                                        : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
                                                )}
                                            >
                                                <method.icon size={24} className={cn(
                                                    "transition-transform group-hover:scale-110",
                                                    formData.provider === method.id.toLowerCase() ? `text-${method.color}-500` : ""
                                                )} />
                                                {method.id}
                                                {formData.provider === method.id.toLowerCase() && (
                                                    <div className={cn("absolute top-2 right-2 h-2 w-2 rounded-full bg-current")} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Name */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Method Label</label>
                                    <div className="relative group">
                                        <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                        <Input
                                            placeholder="e.g. Standard Cash Payment"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="h-14 pl-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-bold text-lg"
                                        />
                                    </div>
                                </div>

                                {(formData.provider === 'paypal' || formData.provider === 'interac') && (
                                    <>
                                        {/* Client ID */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">API Client ID / Email</label>
                                            <div className="relative group">
                                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-purple-500 transition-colors" size={20} />
                                                <Input
                                                    placeholder="Enter connection identifier"
                                                    required
                                                    value={formData.client_id}
                                                    onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                                                    className="h-14 pl-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-purple-500 dark:focus:border-purple-500 transition-all font-bold font-mono text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Client Secret */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">API Secret / Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-pink-500 transition-colors" size={20} />
                                                <Input
                                                    type="password"
                                                    placeholder={isEditModalOpen ? "••••••••••••••••" : "Enter secure API key"}
                                                    required={isAddModalOpen}
                                                    value={formData.client_secret}
                                                    onChange={e => setFormData({ ...formData, client_secret: e.target.value })}
                                                    className="h-14 pl-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-pink-500 dark:focus:border-pink-500 transition-all font-bold text-sm"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Mode Selection */}
                                    <div className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800">
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black tracking-tight uppercase italic">{formData.is_live ? 'Live Mode' : 'Sandbox'}</h4>
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider opacity-60">Production Status</p>
                                        </div>
                                        <Switch
                                            checked={formData.is_live}
                                            onCheckedChange={(v) => setFormData({ ...formData, is_live: v })}
                                            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-amber-500 scale-125"
                                        />
                                    </div>

                                    {/* Status Selection */}
                                    <div className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800">
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black tracking-tight uppercase italic">{!formData.is_active ? 'Disabled' : 'Enabled'}</h4>
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider opacity-60">Visibility Switch</p>
                                        </div>
                                        <Switch
                                            checked={formData.is_active}
                                            onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                                            className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-zinc-300 scale-125"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-10 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                className="w-full sm:w-auto rounded-full px-12 font-black uppercase italic tracking-tighter h-14 text-zinc-500 hover:text-zinc-900"
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-full px-16 gap-3 shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] font-black h-14 uppercase italic tracking-tighter text-xl group transform hover:scale-[1.02] active:scale-95 transition-all border-0"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                                {submitting ? "Processing" : (isAddModalOpen ? 'Create Account' : 'Update Vault')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
