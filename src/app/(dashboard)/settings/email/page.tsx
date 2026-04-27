"use client";

import React, { useEffect, useState } from "react";
import {
    Mail,
    Server,
    Plus,
    Pencil,
    Trash2,
    Check,
    Search,
    Loader2,
    AlertCircle,
    Send,
    Shield,
    Activity,
    ChevronDown,
    Edit2,
} from "lucide-react";
import { useTranslation } from "@/i18n/TranslationContext";
import { EmailConfiguration, EmailService } from "@/lib/email-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function EmailSettingsPage() {
    const [configs, setConfigs] = useState<EmailConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { t } = useTranslation();

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<EmailConfiguration | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<EmailConfiguration>>({
        name: "",
        provider: "smtp",
        from_name: "",
        from_address: "",
        host: "",
        port: 465,
        username: "",
        password: "",
        daily_limit: 100,
        is_active: true
    });
    const [testEmail, setTestEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [testingId, setTestingId] = useState<number | null>(null);
    const [sendingTest, setSendingTest] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const data = await EmailService.getConfigurations();
            setConfigs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch email configs:", error);
            toast.error(t("email.error_load"));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setFormData({
            name: "",
            provider: "smtp",
            from_name: "",
            from_address: "",
            host: "",
            port: 465,
            username: "",
            password: "",
            daily_limit: 100,
            is_active: true
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (config: EmailConfiguration) => {
        setSelectedConfig(config);
        setFormData({
            name: config.name,
            provider: config.provider,
            from_name: config.from_name,
            from_address: config.from_address,
            host: config.host,
            port: config.port,
            username: config.username,
            password: "", // Keep password empty in UI for security
            daily_limit: config.daily_limit,
            is_active: config.is_active
        });
        setIsEditModalOpen(true);
    };

    const handleOpenTestModal = (config: EmailConfiguration) => {
        setSelectedConfig(config);
        setTestEmail("");
        setIsTestModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await EmailService.createConfiguration(formData);
            toast.success(t("email.success_add"));
            setIsAddModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add email service");
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
            if (!updateProps.password) delete updateProps.password; // Don't overwrite if empty

            await EmailService.updateConfiguration(selectedConfig.id, updateProps);
            toast.success(t("email.success_update"));
            setIsEditModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update configuration");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t("email.confirm_delete"))) return;
        try {
            await EmailService.deleteConfiguration(id);
            toast.success(t("email.success_delete"));
            fetchConfigs();
        } catch (error: any) {
            toast.error(t("email.error_delete"));
        }
    };

    const handleTestConnection = async (id: number) => {
        try {
            setTestingId(id);
            const result = await EmailService.testConnection(id);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error(t("email.error_test"));
        } finally {
            setTestingId(null);
        }
    };

    const handleSendTestEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConfig || !testEmail) return;
        try {
            setSendingTest(true);
            const result = await EmailService.sendTestEmail(selectedConfig.id, testEmail);
            if (result.success) {
                toast.success(result.message);
                setIsTestModalOpen(false);
                fetchConfigs(); // Refresh to see usage
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send test email");
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
                        <Mail size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">{t("email.title")}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("email.subtitle")}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <Input
                            placeholder={t("email.search_placeholder")}
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
                        <span className="font-bold">{t("email.add_service")}</span>
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
                                config.is_active ? "from-indigo-500 to-purple-600" : "from-zinc-400 to-zinc-500"
                            )} />

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="h-12 w-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                        <Mail className={cn(config.is_active ? "text-indigo-500" : "text-zinc-400")} size={24} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge className={cn(
                                            "rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider",
                                            config.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" : "bg-red-100 text-red-700 dark:bg-red-900/30"
                                        )}>
                                            {config.is_active ? t("email.active") : t("email.disabled")}
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
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{config.host}</p>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-tight">Username:</span>
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-200">{config.username}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-tight">Port:</span>
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-200">{config.port}</span>
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
                                        {t("email.test_connection")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-20 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="h-20 w-20 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 mb-6">
                        <Mail size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">{t("email.no_services")}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 font-medium">{t("email.no_services_desc")}</p>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-2xl px-8 h-12 font-bold hover:opacity-90"
                    >
                        {t("email.add_first")}
                    </Button>
                </div>
            )}

            {/* Test Email Modal */}
            <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Send size={20} />
                            {t("email.send_test")}
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            {t("email.send_test_desc")} <span className="font-bold underline">"{selectedConfig?.name}"</span>.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSendTestEmail}>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("email.recipient")}</label>
                                <Input
                                    type="email"
                                    placeholder={t("email.recipient_placeholder")}
                                    required
                                    value={testEmail}
                                    onChange={e => setTestEmail(e.target.value)}
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
                                {t("common.discard")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={sendingTest || !testEmail}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {sendingTest ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                                {sendingTest ? t("email.sending") : t("email.send_test")}
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
                <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Mail size={20} />
                            {isAddModalOpen ? t("email.connect_title") : t("email.update_title")}
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            {isAddModalOpen
                                ? t("email.connect_desc")
                                : `${t("email.update_desc")} ${selectedConfig?.name}`
                            }
                        </DialogDescription>
                    </div>

                    <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate}>
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("email.config_name")}</label>
                                    <Input
                                        placeholder="e.g. Resend SMTP"
                                        required
                                        value={formData.name || ""}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("email.service_provider")}</label>
                                    <Select
                                        value={formData.provider}
                                        onValueChange={(v: any) => setFormData({ ...formData, provider: v })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 font-bold">
                                            <SelectValue placeholder={t("email.select_provider")} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 font-bold">
                                            <SelectItem value="smtp">Standard SMTP</SelectItem>
                                            <SelectItem value="resend">Resend.com API</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("email.from_name")}</label>
                                    <Input
                                        placeholder="e.g. Acme Corp"
                                        required
                                        value={formData.from_name || ""}
                                        onChange={e => setFormData({ ...formData, from_name: e.target.value })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("email.from_address")}</label>
                                    <Input
                                        type="email"
                                        placeholder="e.g. hello@acme.com"
                                        required
                                        value={formData.from_address || ""}
                                        onChange={e => setFormData({ ...formData, from_address: e.target.value })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                {formData.provider === 'smtp' && (
                                    <>
                                        <div className="space-y-2 flex-grow">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("email.smtp_host")}</label>
                                            <Input
                                                placeholder="smtp.example.com"
                                                required={formData.provider === 'smtp'}
                                                value={formData.host || ""}
                                                onChange={e => setFormData({ ...formData, host: e.target.value })}
                                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("email.port")}</label>
                                            <Input
                                                type="number"
                                                placeholder="465"
                                                required={formData.provider === 'smtp'}
                                                value={formData.port || ""}
                                                onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })}
                                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-1 md:col-span-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">{t("email.username")}</label>
                                            <Input
                                                placeholder="Your SMTP username"
                                                required={formData.provider === 'smtp'}
                                                value={formData.username || ""}
                                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                                        {formData.provider === 'smtp' ? t("email.password") : t("email.api_key")}
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder={formData.provider === 'smtp' ? "••••••••" : "re_..."}
                                        required={isAddModalOpen}
                                        value={formData.password || ""}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                    />
                                    {isEditModalOpen && <p className="text-[10px] text-zinc-400 font-bold italic px-1">{t("email.password_help")}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Daily Limit</label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={formData.daily_limit || ""}
                                        onChange={e => setFormData({ ...formData, daily_limit: parseInt(e.target.value) })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl col-span-1 md:col-span-2 border border-zinc-100 dark:border-zinc-800 mt-2">
                                    <div>
                                        <p className="text-sm font-bold tracking-tight">{t("email.active_status")}</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t("email.status_desc")}</p>
                                    </div>
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(v: boolean) => setFormData({ ...formData, is_active: v })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                className="rounded-full px-6 font-bold"
                            >
                                {t("common.discard")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full px-8 gap-2 h-11 shadow-md font-bold"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : (isAddModalOpen ? <Plus size={18} /> : <Check size={18} />)}
                                {submitting ? t("common.saving") : (isAddModalOpen ? t("email.connect_btn") : t("email.update_btn"))}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
