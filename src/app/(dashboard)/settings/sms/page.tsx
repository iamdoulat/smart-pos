"use client"

import React, { useState, useEffect } from "react";
import {
    MessageSquare,
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Smartphone,
    Send,
    Loader2,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Info
} from "lucide-react";
import { useTranslation } from "@/i18n/TranslationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { SmsService, SmsConfiguration } from "@/lib/sms-service";

export default function SmsSettingsPage() {
    const [configs, setConfigs] = useState<SmsConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<SmsConfiguration | null>(null);
    const { t } = useTranslation();

    // Form states
    const [formData, setFormData] = useState<Partial<SmsConfiguration>>({
        name: "",
        provider: "twilio",
        account_sid: "",
        auth_token: "",
        from_number: "",
        daily_limit: 100,
        is_active: true
    });
    const [testPhone, setTestPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const data = await SmsService.getConfigurations();
            setConfigs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch SMS configs:", error);
            toast.error(t("sms.error_load"));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setFormData({
            name: "",
            provider: "twilio",
            account_sid: "",
            auth_token: "",
            from_number: "",
            daily_limit: 100,
            is_active: true
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (config: SmsConfiguration) => {
        setSelectedConfig(config);
        setFormData({
            name: config.name,
            provider: config.provider,
            account_sid: config.account_sid,
            auth_token: "", // Keep token empty in UI for security
            from_number: config.from_number,
            daily_limit: config.daily_limit,
            is_active: config.is_active
        });
        setIsEditModalOpen(true);
    };

    const handleOpenTestModal = (config: SmsConfiguration) => {
        setSelectedConfig(config);
        setTestPhone("");
        setIsTestModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await SmsService.createConfiguration(formData);
            toast.success(t("sms.success_add"));
            setIsAddModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("sms.error_load"));
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
            if (!updateProps.auth_token) delete updateProps.auth_token;

            await SmsService.updateConfiguration(selectedConfig.id, updateProps);
            toast.success(t("sms.success_update"));
            setIsEditModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("sms.error_load"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t("sms.confirm_delete"))) return;
        try {
            await SmsService.deleteConfiguration(id);
            toast.success(t("sms.success_delete"));
            fetchConfigs();
        } catch (error: any) {
            toast.error(t("sms.error_load"));
        }
    };

    const handleSendTestSms = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConfig || !testPhone) return;
        try {
            setSendingTest(true);
            const result = await SmsService.sendTestSms(selectedConfig.id, testPhone);
            if (result.success) {
                toast.success(result.message);
                setIsTestModalOpen(false);
                fetchConfigs();
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || t("sms.error_load"));
        } finally {
            setSendingTest(false);
        }
    };

    const filteredConfigs = configs.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full p-4 md:p-6 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">{t("sms.title")}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("sms.subtitle")}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <Input
                            placeholder={t("sms.search_placeholder")}
                            className="pl-10 h-11 w-full md:w-64 rounded-xl border-zinc-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full px-6 gap-2 h-11 shadow-md"
                    >
                        <Plus size={18} />
                        <span className="font-bold">{t("sms.add_gateway")}</span>
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
                            className={cn(
                                "group relative h-full bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md flex flex-col",
                                config.is_active ? "border-zinc-200 dark:border-zinc-800" : "border-red-100 dark:border-red-900/30 opacity-75 grayscale-[0.5]"
                            )}
                        >
                            {/* Card Decorative Top */}
                            <div className={cn(
                                "h-2 bg-gradient-to-r",
                                config.provider === 'twilio' ? "from-red-500 to-rose-600" : "from-zinc-400 to-zinc-500"
                            )} />

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-12 w-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                        <Smartphone className={cn(config.is_active ? "text-red-500" : "text-zinc-400")} size={24} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge className={cn(
                                            "rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider",
                                            config.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" : "bg-red-100 text-red-700 dark:bg-red-900/30"
                                        )}>
                                            {config.is_active ? t("sms.active") : t("sms.disabled")}
                                        </Badge>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEditModal(config)}
                                                className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900"
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(config.id)}
                                                className="h-8 w-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">{config.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{config.provider.replace('_', ' ')}</p>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-tight">SID:</span>
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-200">{config.account_sid.substring(0, 12)}...</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-tight">{t("sms.from_number")}:</span>
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-200">{config.from_number}</span>
                                        </div>
                                    </div>

                                    {/* Usage Progress */}
                                    <div className="pt-4 space-y-2">
                                        <div className="flex justify-between items-end text-[10px]">
                                            <span className="font-bold text-zinc-400 uppercase">{t("sms.daily_usage")}</span>
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{config.daily_usage} / {config.daily_limit}</span>
                                        </div>
                                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500 transition-all duration-1000"
                                                style={{ width: `${Math.min((config.daily_usage / config.daily_limit) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Button
                                        onClick={() => handleOpenTestModal(config)}
                                        disabled={!config.is_active}
                                        variant="outline"
                                        className="w-full rounded-xl font-bold border-zinc-200 dark:border-zinc-800 h-11 hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900 transition-all text-xs"
                                    >
                                        <Send className="mr-2" size={14} />
                                        {t("sms.send_test")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[50px] p-24 flex flex-col items-center justify-center text-center">
                    <div className="h-24 w-24 rounded-[32px] bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 mb-8 border-2 border-zinc-100 dark:border-zinc-700">
                        <Smartphone size={48} />
                    </div>
                    <h3 className="text-3xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100 mb-3 uppercase">{t("sms.no_gateways")}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-10 font-bold text-lg leading-tight tracking-tight">{t("sms.no_gateways_desc")}</p>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-3xl px-12 h-16 font-black text-xl hover:opacity-90 transform -rotate-2 hover:rotate-0 transition-all shadow-2xl shadow-zinc-900/20"
                    >
                        {t("sms.connect_twilio")}
                    </Button>
                </div>
            )}

            {/* Test SMS Modal */}
            <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Send size={20} />
                            {t("sms.test_gateway_title")}
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            {t("sms.test_gateway_desc")} <span className="font-bold underline">"{selectedConfig?.name}"</span>.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSendTestSms}>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("sms.recipient_phone")}</label>
                                <Input
                                    type="text"
                                    placeholder="+1 234 567 8900"
                                    required
                                    value={testPhone}
                                    onChange={e => setTestPhone(e.target.value)}
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsTestModalOpen(false)}
                                className="rounded-full px-6 font-bold"
                            >
                                {t("sms.discard")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={sendingTest || !testPhone}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {sendingTest ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                {sendingTest ? t("common.sending") : t("sms.send_test")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

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
                <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Smartphone size={20} />
                            {isAddModalOpen ? t("sms.connect_new_title") : t("sms.update_service_title")}
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            {isAddModalOpen
                                ? t("sms.add_gateway_desc")
                                : `${t("sms.test_gateway_desc")} ${selectedConfig?.name}`
                            }
                        </DialogDescription>
                    </div>

                    <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate}>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                {/* General Info */}
                                <div className="col-span-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
                                        <Info size={12} />
                                        General Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("sms.friendly_name")}</label>
                                            <Input
                                                placeholder="e.g. Twilio Primary"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("sms.daily_limit")}</label>
                                            <Input
                                                type="number"
                                                required
                                                value={formData.daily_limit}
                                                onChange={e => setFormData({ ...formData, daily_limit: parseInt(e.target.value) })}
                                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Credentials */}
                                <div className="col-span-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-4 flex items-center gap-2">
                                        <ShieldCheck size={12} />
                                        API Credentials
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("sms.account_sid")}</label>
                                            <Input
                                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                required
                                                value={formData.account_sid}
                                                onChange={e => setFormData({ ...formData, account_sid: e.target.value })}
                                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold font-mono"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("sms.auth_token")}</label>
                                                <Input
                                                    type="password"
                                                    placeholder={isEditModalOpen ? "••••••••••••••••" : t("sms.auth_token")}
                                                    required={isAddModalOpen}
                                                    value={formData.auth_token}
                                                    onChange={e => setFormData({ ...formData, auth_token: e.target.value })}
                                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("sms.from_number")}</label>
                                                <Input
                                                    placeholder="+1234567890"
                                                    required
                                                    value={formData.from_number}
                                                    onChange={e => setFormData({ ...formData, from_number: e.target.value })}
                                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <div className="space-y-0.5">
                                    <h4 className="text-sm font-bold tracking-tight">{t("sms.active_status")}</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t("sms.enable_disable")}</p>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                className="rounded-full px-6 font-bold"
                            >
                                {t("sms.discard")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {submitting ? t("common.saving") : (isAddModalOpen ? t("sms.connect_gateway") : t("sms.update_service"))}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
