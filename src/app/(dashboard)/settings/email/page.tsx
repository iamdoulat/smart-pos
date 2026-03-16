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
} from "lucide-react";
import { EmailConfiguration, EmailService } from "@/lib/email-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EmailSettingsPage() {
    const [configs, setConfigs] = useState<EmailConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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
            toast.error("Failed to load email configurations");
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
            toast.success("Email service added successfully");
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
        if (!confirm("Are you sure you want to delete this email service?")) return;
        try {
            await EmailService.deleteConfiguration(id);
            toast.success("Service deleted successfully");
            fetchConfigs();
        } catch (error: any) {
            toast.error("Failed to delete service");
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
            toast.error("Connection test failed");
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
        <div className="max-w-6xl mx-auto space-y-8 pb-20 p-6 md:p-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">Email Settings</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Manage your SMTP servers and API service providers.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 py-6 h-auto"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-bold">Add New Service</span>
                    </Button>
                </div>
            </div>

            {/* Toolbar section */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <Input
                    placeholder="Search providers..."
                    className="pl-12 h-14 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-500 gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                    <p className="font-semibold animate-pulse">Loading configurations...</p>
                </div>
            ) : filteredConfigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredConfigs.map((config) => (
                        <div key={config.id} className="relative group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none transition-all duration-300">
                            {/* Active Badge */}
                            {config.is_active && (
                                <div className="absolute top-6 right-6">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 dark:border-green-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Active
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Service Info */}
                                <div className="flex items-start gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-500 dark:group-hover:bg-blue-500/10 transition-colors">
                                        {config.provider === 'smtp' ? <Server size={28} /> : <Activity size={28} />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{config.name}</h3>
                                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-tighter">
                                            {config.provider === 'smtp' ? 'Standard SMTP Server' : 'Resend.com API Service'}
                                        </p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="space-y-3 py-4 border-y border-zinc-100 dark:border-zinc-800">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500 font-medium">From:</span>
                                        <span className="text-zinc-900 dark:text-zinc-100 font-bold text-right truncate max-w-[200px]">
                                            {config.from_name} &lt;{config.from_address}&gt;
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500 font-medium">Host:</span>
                                        <span className="text-zinc-900 dark:text-zinc-100 font-black tracking-tight">
                                            {config.provider === 'smtp' ? `${config.host}:${config.port}` : 'api.resend.com'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-500 font-medium">Related ID:</span>
                                        <span className="text-zinc-300 font-mono text-[10px] uppercase">
                                            {btoa(config.id.toString()).substring(0, 16)}
                                        </span>
                                    </div>
                                </div>

                                {/* Usage Section */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-zinc-500">Daily Usage:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-black text-blue-600 dark:text-blue-400">
                                                {config.daily_usage} / {config.daily_limit || '∞'}
                                            </span>
                                            <Mail size={14} className="text-zinc-300" />
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min((config.daily_usage / (config.daily_limit || 100)) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 text-center font-medium italic">Counts emails sent within the current 24h period</p>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenEditModal(config)}
                                            className="h-10 w-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                                        >
                                            <Pencil size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(config.id)}
                                            className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 text-rose-500"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={() => handleOpenTestModal(config)}
                                        disabled={testingId === config.id || !config.is_active}
                                        variant="outline"
                                        className="rounded-xl font-bold border-zinc-200 dark:border-zinc-700 h-10 px-4 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    >
                                        <Send className="mr-2" size={14} />
                                        Test Connection
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
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">No Email Services Integrated</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 font-medium">Add a standard SMTP server or Resend.com API to enable email notifications and reporting.</p>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-2xl px-8 h-12 font-bold hover:opacity-90"
                    >
                        + Add Your First Provider
                    </Button>
                </div>
            )}

            {/* Test Email Modal */}
            <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Send size={20} />
                            Send Test Email
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            Verify configuration for <span className="font-bold underline">"{selectedConfig?.name}"</span>.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSendTestEmail}>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Recipient Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="e.g. hello@example.com"
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
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={sendingTest || !testEmail}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {sendingTest ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                                {sendingTest ? "Sending..." : "Send Test Email"}
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
                            {isAddModalOpen ? 'Connect New Email Service' : 'Update Email Configuration'}
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            {isAddModalOpen
                                ? 'Configure your SMTP or API delivery settings.'
                                : `Modifying configuration for ${selectedConfig?.name}`
                            }
                        </DialogDescription>
                    </div>

                    <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate}>
                        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Configuration Name</label>
                                    <Input
                                        placeholder="e.g. Resend SMTP"
                                        required
                                        value={formData.name || ""}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Service Provider</label>
                                    <Select
                                        value={formData.provider}
                                        onValueChange={(v: any) => setFormData({ ...formData, provider: v })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 font-bold">
                                            <SelectValue placeholder="Select Provider" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 font-bold">
                                            <SelectItem value="smtp">Standard SMTP</SelectItem>
                                            <SelectItem value="resend">Resend.com API</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">From Email Name</label>
                                    <Input
                                        placeholder="e.g. Acme Corp"
                                        required
                                        value={formData.from_name || ""}
                                        onChange={e => setFormData({ ...formData, from_name: e.target.value })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">From Address</label>
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
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">SMTP Host</label>
                                            <Input
                                                placeholder="smtp.example.com"
                                                required={formData.provider === 'smtp'}
                                                value={formData.host || ""}
                                                onChange={e => setFormData({ ...formData, host: e.target.value })}
                                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Port</label>
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
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Username / Email</label>
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
                                        {formData.provider === 'smtp' ? 'Password' : 'API Key'}
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder={formData.provider === 'smtp' ? "••••••••" : "re_..."}
                                        required={isAddModalOpen}
                                        value={formData.password || ""}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                    />
                                    {isEditModalOpen && <p className="text-[10px] text-zinc-400 font-bold italic px-1">Leave empty to keep existing password.</p>}
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
                                        <p className="text-sm font-bold tracking-tight">Active Status</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Enable or disable service</p>
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
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : (isAddModalOpen ? <Plus size={18} /> : <Check size={18} />)}
                                {submitting ? "Saving..." : (isAddModalOpen ? 'Connect Service' : 'Update Configuration')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
