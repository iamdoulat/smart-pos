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
            toast.error("Failed to load SMS configurations");
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
            toast.success("SMS service added successfully");
            setIsAddModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add SMS service");
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
        if (!confirm("Are you sure you want to delete this SMS service?")) return;
        try {
            await SmsService.deleteConfiguration(id);
            toast.success("Service deleted successfully");
            fetchConfigs();
        } catch (error: any) {
            toast.error("Failed to delete service");
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
            toast.error(error.response?.data?.message || "Failed to send test SMS");
        } finally {
            setSendingTest(false);
        }
    };

    const filteredConfigs = configs.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 transform -rotate-3 transition-transform hover:rotate-0">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">SMS Settings</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Configure Twilio and other SMS gateways for notifications.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={18} />
                        <Input
                            placeholder="Search gateways..."
                            className="pl-12 pr-6 h-12 w-full md:w-80 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-zinc-100 transition-all font-bold shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 py-6 h-auto"
                    >
                        <Plus size={18} />
                        <span className="font-bold">Add Gateway</span>
                    </Button>
                </div>
            </div>

            {/* List Section */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 rounded-[40px] bg-zinc-100 dark:bg-zinc-800 animate-pulse border-2 border-zinc-200 dark:border-zinc-700" />
                    ))}
                </div>
            ) : filteredConfigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredConfigs.map(config => (
                        <div
                            key={config.id}
                            className={`group relative h-full bg-white dark:bg-zinc-900 rounded-[40px] border-2 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 flex flex-col ${config.is_active ? 'border-zinc-100 dark:border-zinc-800' : 'border-red-100 dark:border-red-900/30 opacity-75 grayscale-[0.5]'
                                }`}
                        >
                            {/* Card Header Gradient */}
                            <div className={`h-24 transition-all duration-500 group-hover:h-28 ${config.provider === 'twilio'
                                ? 'bg-gradient-to-br from-red-500 to-red-600'
                                : 'bg-gradient-to-br from-zinc-800 to-zinc-900'
                                }`} />

                            <div className="px-8 pb-8 flex-1 flex flex-col">
                                {/* Provider Icon & Name */}
                                <div className="flex justify-between items-start -mt-10 mb-6">
                                    <div className="h-20 w-20 rounded-3xl bg-white dark:bg-zinc-800 shadow-xl border-4 border-zinc-50 dark:border-zinc-950 flex items-center justify-center p-4">
                                        <Smartphone className={config.provider === 'twilio' ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100 text-white'} size={32} />
                                    </div>
                                    <div className="pt-12 flex flex-col items-end gap-2">
                                        <Badge className={`rounded-full px-3 py-1 font-bold ${config.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {config.is_active ? 'ACTIVE' : 'DISABLED'}
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
                                        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 uppercase italic tracking-tighter truncate">{config.name}</h3>
                                        <p className="text-xs font-black uppercase tracking-widest text-red-500">{config.provider.replace('_', ' ')} SERVICE</p>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500 font-bold uppercase tracking-tight">SID:</span>
                                            <span className="font-black text-zinc-900 dark:text-zinc-200">
                                                {config.account_sid.substring(0, 10)}...
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500 font-bold uppercase tracking-tight">From:</span>
                                            <span className="font-black text-zinc-900 dark:text-zinc-200 truncate max-w-[150px]">{config.from_number}</span>
                                        </div>
                                    </div>

                                    {/* Usage Tracker */}
                                    <div className="pt-6 space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Daily Progress</span>
                                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 italic">{config.daily_usage} <span className="text-zinc-400">/ {config.daily_limit}</span></span>
                                        </div>
                                        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-1 border border-zinc-50 dark:border-zinc-850">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-red-500 to-rose-600"
                                                style={{ width: `${Math.min((config.daily_usage / config.daily_limit) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-medium text-center italic">Resets every 24 hours</p>
                                    </div>
                                </div>

                                {/* Active Configuration Actions */}
                                <div className="pt-8">
                                    <Button
                                        onClick={() => handleOpenTestModal(config)}
                                        disabled={!config.is_active}
                                        variant="outline"
                                        className="w-full rounded-2xl font-black border-2 border-zinc-100 dark:border-zinc-800 h-14 hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900 transition-all uppercase italic tracking-tighter text-lg group/btn"
                                    >
                                        <Send className="mr-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" size={18} />
                                        Send Test SMS
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
                    <h3 className="text-3xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100 mb-3 uppercase">No Gateways Configured</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-10 font-bold text-lg leading-tight tracking-tight">Sync your Twilio account to start sending automated SMS alerts today.</p>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-3xl px-12 h-16 font-black text-xl hover:opacity-90 transform -rotate-2 hover:rotate-0 transition-all shadow-2xl shadow-zinc-900/20"
                    >
                        CONNECT TWILIO NOW
                    </Button>
                </div>
            )}

            {/* Test SMS Modal */}
            <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Send size={20} />
                            Test SMS Gateway
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            Verify connectivity for <span className="font-bold underline">"{selectedConfig?.name}"</span>.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSendTestSms}>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Recipient Phone Number</label>
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
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={sendingTest || !testPhone}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {sendingTest ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                {sendingTest ? "Sending..." : "Send Test SMS"}
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
                            {isAddModalOpen ? 'Connect New Gateway' : 'Update SMS Service'}
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            {isAddModalOpen
                                ? 'Add your Twilio credentials to start sending SMS alerts.'
                                : `Modifying configuration for ${selectedConfig?.name}`
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
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Friendly Name</label>
                                            <Input
                                                placeholder="e.g. Twilio Primary"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Daily Limit</label>
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
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Account SID</label>
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
                                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Auth Token</label>
                                                <Input
                                                    type="password"
                                                    placeholder={isEditModalOpen ? "••••••••••••••••" : "Auth Token"}
                                                    required={isAddModalOpen}
                                                    value={formData.auth_token}
                                                    onChange={e => setFormData({ ...formData, auth_token: e.target.value })}
                                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">From Number</label>
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
                                    <h4 className="text-sm font-bold tracking-tight">Active Status</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Enable or disable gateway</p>
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
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {submitting ? "Saving..." : (isAddModalOpen ? 'Connect Gateway' : 'Update Service')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
