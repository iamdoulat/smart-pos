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
import { useTranslation } from "@/i18n/TranslationContext";
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
    const { t } = useTranslation();

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
            toast.error(t("payments.error_load"));
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
            toast.success(t("payments.success_add"));
            setIsAddModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("payments.error_delete")); // Using fallback
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
            toast.success(t("payments.success_update"));
            setIsEditModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("payments.error_delete")); // Using fallback
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t("common.confirm_delete_text"))) return;
        try {
            await PaymentService.deleteConfiguration(id);
            toast.success(t("payments.success_delete"));
            fetchConfigs();
        } catch (error: any) {
            toast.error(t("payments.error_delete"));
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
            default: return "from-zinc-400 to-zinc-600";
        }
    };

    return (
        <div className="w-full p-4 md:p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">{t("payments.title")}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("payments.subtitle")}</p>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-3">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <Input
                            placeholder={t("payments.filter_placeholder")}
                            className="pl-12 h-12 rounded-2xl border-zinc-200 dark:border-zinc-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 text-white rounded-full px-6 gap-2 h-11 hover:scale-[1.02] active:scale-95 transition-all shadow-md font-bold border-0"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">{t("payments.add_btn")}</span>
                    </Button>
                </div>
            </div>

            {/* List Section */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse border border-zinc-200 dark:border-zinc-700" />
                    ))}
                </div>
            ) : filteredConfigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredConfigs.map(config => (
                        <div
                            key={config.id}
                            className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all hover:shadow-md"
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <Badge className={cn(
                                    "rounded-full px-3 py-1 font-bold",
                                    config.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" : "bg-red-100 text-red-700 dark:bg-red-900/30"
                                )}>
                                    {config.is_active ? t("payments.enabled") : t("payments.disabled")}
                                </Badge>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                        {getIcon(config.provider)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{config.name}</h3>
                                        <p className="text-xs text-zinc-500 uppercase font-black tracking-widest">{config.provider}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleOpenEditModal(config)}
                                        className="flex-1 rounded-xl border-zinc-200 dark:border-zinc-700 font-bold h-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <Edit2 size={16} className="mr-2 text-indigo-500" />
                                        {t("payments.edit_btn", "Edit")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDelete(config.id)}
                                        className="rounded-xl border-zinc-200 dark:border-zinc-700 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 px-4"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
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
                    <h3 className="text-3xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100 mb-3 uppercase">{t("payments.empty_title")}</h3>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-sm mb-12 font-bold tracking-tight">{t("payments.empty_desc")}</p>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-indigo-600 text-white rounded-3xl px-12 h-16 font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 border-0"
                    >
                        {t("payments.init_gateway")}
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
                            {isAddModalOpen ? t("payments.config_title") : t("payments.modify_title")}
                        </DialogTitle>
                        <DialogDescription className="text-white/70 text-sm mt-3 font-bold uppercase tracking-widest opacity-80">
                            {isAddModalOpen
                                ? t("payments.config_desc")
                                : `${t("payments.modify_desc")} ${selectedConfig?.name}`
                            }
                        </DialogDescription>
                    </div>

                    <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate} className="bg-white dark:bg-zinc-950">
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                                {/* Provider Selection */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">{t("payments.type_label")}</label>
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
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">{t("payments.label_label")}</label>
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
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">{t("payments.client_id_label")}</label>
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
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">{t("payments.client_secret_label")}</label>
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
                                            <h4 className="text-xs font-black tracking-tight uppercase italic">{formData.is_live ? t("payments.live_mode") : t("payments.sandbox")}</h4>
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider opacity-60">{t("payments.prod_status")}</p>
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
                                            <h4 className="text-xs font-black tracking-tight uppercase italic">{!formData.is_active ? t("payments.disabled") : t("payments.enabled")}</h4>
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider opacity-60">{t("payments.visibility_switch")}</p>
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
                                {t("payments.discard")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-full px-16 gap-3 shadow-[0_20px_40px_-10px_rgba(99,102,241,0.4)] font-black h-14 uppercase italic tracking-tighter text-xl group transform hover:scale-[1.02] active:scale-95 transition-all border-0"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                                {submitting ? t("payments.processing") : (isAddModalOpen ? t("payments.create_account") : t("payments.update_vault"))}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
