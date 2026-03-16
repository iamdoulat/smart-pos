"use client"

import React, { useState, useEffect } from "react";
import {
    MessageCircle,
    Plus,
    Search,
    Edit2,
    Trash2,
    Smartphone,
    Send,
    Loader2,
    CheckCircle2,
    Activity,
    X,
    Lock,
    User,
    Globe,
    Layers
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
import { WhatsappService, WhatsappConfiguration } from "@/lib/whatsapp-service";
import { cn } from "@/lib/utils";

export default function WhatsappSettingsPage() {
    const [configs, setConfigs] = useState<WhatsappConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<WhatsappConfiguration | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<WhatsappConfiguration>>({
        name: "",
        account_id: "",
        api_secret: "",
        daily_limit: 0,
        is_active: true
    });
    const [testRecipient, setTestRecipient] = useState("");
    const [testMessage, setTestMessage] = useState("Hello! This is a test message from our WhatsApp API Gateway.");
    const [submitting, setSubmitting] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const data = await WhatsappService.getConfigurations();
            setConfigs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch WhatsApp configs:", error);
            toast.error("Failed to load WhatsApp configurations");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setFormData({
            name: "",
            account_id: "",
            api_secret: "",
            daily_limit: 0,
            is_active: true
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (config: WhatsappConfiguration) => {
        setSelectedConfig(config);
        setFormData({
            name: config.name,
            account_id: config.account_id,
            api_secret: "", // Keep secret empty in UI for security
            daily_limit: config.daily_limit,
            is_active: config.is_active
        });
        setIsEditModalOpen(true);
    };

    const handleOpenTestModal = (config: WhatsappConfiguration) => {
        setSelectedConfig(config);
        setTestRecipient("");
        setTestMessage("Hello! This is a test message from our WhatsApp API Gateway.");
        setIsTestModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await WhatsappService.createConfiguration(formData);
            toast.success("WhatsApp service added successfully");
            setIsAddModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            console.error("Creation Error Details:", error.response?.data);
            const errMsg = error.response?.data?.message || error.message || "Failed to add WhatsApp service";
            toast.error(errMsg);
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
            if (!updateProps.api_secret) delete updateProps.api_secret;

            await WhatsappService.updateConfiguration(selectedConfig.id, updateProps);
            toast.success("Configuration updated successfully");
            setIsEditModalOpen(false);
            fetchConfigs();
        } catch (error: any) {
            console.error("Update Error Details:", error.response?.data);
            const errMsg = error.response?.data?.message || error.message || "Failed to update configuration";
            toast.error(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this WhatsApp service?")) return;
        try {
            await WhatsappService.deleteConfiguration(id);
            toast.success("Service deleted successfully");
            fetchConfigs();
        } catch (error: any) {
            toast.error("Failed to delete service");
        }
    };

    const handleSendTestWhatsapp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConfig || !testRecipient || !testMessage) return;
        try {
            setSendingTest(true);
            const result = await WhatsappService.sendTestWhatsapp(selectedConfig.id, testRecipient, testMessage);
            if (result.success) {
                toast.success(result.message);
                setIsTestModalOpen(false);
                fetchConfigs();
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            console.error("Test Error Details:", error.response?.data);
            toast.error(error.response?.data?.message || "Failed to send test message");
        } finally {
            setSendingTest(false);
        }
    };

    const filteredConfigs = configs.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.account_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20 transform -rotate-3 transition-transform hover:rotate-0">
                        <MessageCircle size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-emerald-500 via-green-600 to-teal-500 bg-clip-text text-transparent tracking-tight">WhatsApp Settings</h2>
                        <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
                            Manage your WhatsApp API gateways (bipsms.com).
                        </p>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-3 md:gap-4">
                    <div className="relative group min-w-[140px] xs:min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={16} />
                        <Input
                            placeholder="Search gateways..."
                            className="pl-11 pr-4 h-10 md:h-12 w-full sm:w-64 md:w-80 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-emerald-600 text-white rounded-full px-4 md:px-8 gap-2 shadow-lg shadow-emerald-500/20 h-10 md:h-12 flex items-center justify-center whitespace-nowrap"
                    >
                        <Plus size={18} />
                        <span className="font-bold hidden xs:inline">Add Gateway</span>
                        <span className="font-bold inline xs:hidden">Add</span>
                    </Button>
                </div>
            </div>

            {/* List Section */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 md:h-80 rounded-[40px] bg-zinc-100 dark:bg-zinc-800 animate-pulse border-2 border-zinc-200 dark:border-zinc-700" />
                    ))}
                </div>
            ) : filteredConfigs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredConfigs.map(config => (
                        <div
                            key={config.id}
                            className={cn(
                                "group relative h-full bg-white dark:bg-zinc-900 rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 flex flex-col",
                                config.is_active ? "border-emerald-100 dark:border-emerald-900/30" : "border-zinc-100 dark:border-zinc-800 opacity-75 grayscale-[0.5]"
                            )}
                        >
                            <div className={cn(
                                "h-16 md:h-24 transition-all duration-500 group-hover:h-20 md:group-hover:h-28",
                                config.is_active
                                    ? "bg-gradient-to-br from-emerald-500 to-green-600"
                                    : "bg-gradient-to-br from-zinc-400 to-zinc-500"
                            )} />

                            <div className="px-6 md:px-8 pb-6 md:pb-8 flex-1 flex flex-col">
                                <div className="flex justify-between items-start -mt-8 md:-mt-10 mb-4 md:mb-6">
                                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-white dark:bg-zinc-800 shadow-xl border-4 border-zinc-50 dark:border-zinc-950 flex items-center justify-center p-3 md:p-4">
                                        <MessageCircle className={cn(config.is_active ? "text-emerald-500" : "text-zinc-400")} size={28} />
                                    </div>
                                    <div className="pt-10 md:pt-12 flex flex-col items-end gap-2">
                                        {config.is_active && (
                                            <Badge className="rounded-full px-2 md:px-3 py-0.5 md:py-1 font-bold bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20 text-[10px] md:text-xs">
                                                <CheckCircle2 size={10} className="mr-1" /> ACTIVE
                                            </Badge>
                                        )}
                                        {!config.is_active && (
                                            <Badge className="rounded-full px-2 md:px-3 py-0.5 md:py-1 font-bold bg-red-100 text-red-700 border-0 text-[10px] md:text-xs">
                                                DISABLED
                                            </Badge>
                                        )}
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEditModal(config)}
                                                className="h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 shadow-sm"
                                            >
                                                <Edit2 size={12} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(config.id)}
                                                className="h-7 w-7 md:h-8 md:w-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600 shadow-sm"
                                            >
                                                <Trash2 size={12} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter truncate">{config.name}</h3>
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-500">WHATSAPP GATEWAY</p>
                                    </div>

                                    <div className="space-y-3 pt-1 md:pt-2">
                                        <div className="flex flex-col text-sm">
                                            <span className="text-zinc-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">ID:</span>
                                            <span className="font-mono text-[10px] md:text-[11px] text-zinc-600 dark:text-zinc-400 break-all leading-tight mt-1">
                                                {config.account_id}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 md:pt-6 space-y-2 md:space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Daily Usage: <span className="text-zinc-900 dark:text-zinc-100">{config.daily_usage} / {config.daily_limit === 0 ? '∞' : config.daily_limit}</span></span>
                                        </div>
                                        <div className="h-1.5 md:h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-400 to-green-600"
                                                style={{ width: config.daily_limit === 0 ? (config.daily_usage > 0 ? '100%' : '0%') : `${Math.min((config.daily_usage / config.daily_limit) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 md:pt-8 flex gap-3">
                                    <Button
                                        onClick={() => handleOpenTestModal(config)}
                                        disabled={!config.is_active}
                                        variant="outline"
                                        className="flex-1 rounded-xl md:rounded-2xl font-black border-2 border-zinc-100 dark:border-zinc-800 h-11 md:h-14 hover:bg-emerald-500 hover:text-white transition-all uppercase italic tracking-tighter text-sm md:text-base group/btn"
                                    >
                                        <Send className="mr-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" size={14} />
                                        Test Gateway
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[30px] md:rounded-[50px] p-12 md:p-24 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-[32px] bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-300 dark:text-emerald-700 mb-6 md:mb-8 border-2 border-emerald-100 dark:border-emerald-900/50">
                        <MessageCircle size={32} className="md:w-12 md:h-12" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100 mb-2 md:mb-3 uppercase">No Gateway Found</h3>
                    <p className="text-sm md:text-lg text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 md:mb-10 font-bold tracking-tight">Connect your bipsms.com WhatsApp account to start sending messages reliably.</p>
                    <Button
                        onClick={handleOpenAddModal}
                        className="bg-emerald-500 text-white rounded-2xl md:rounded-3xl px-8 md:px-12 h-14 md:h-16 font-black md:text-xl hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/20 transform -rotate-1 hover:rotate-0"
                    >
                        CONNECT ACCOUNT NOW
                    </Button>
                </div>
            )}

            {/* Test WhatsApp Modal */}
            <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                <DialogContent className="max-w-md w-[95vw] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl bg-white dark:bg-zinc-900">
                    <div className="bg-gradient-to-r from-emerald-500 via-green-600 to-teal-500 p-6 md:p-8 text-white relative">
                        <Button
                            onClick={() => setIsTestModalOpen(false)}
                            className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white border-0 p-0 flex items-center justify-center"
                        >
                            <X size={16} />
                        </Button>
                        <DialogTitle className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2 uppercase italic">
                            <Send size={20} />
                            Test Connection
                        </DialogTitle>
                        <DialogDescription className="text-emerald-50/90 text-[10px] md:text-xs mt-1 font-bold">
                            Send a test WhatsApp message using <span className="text-white underline underline-offset-4 decoration-2">"{selectedConfig?.name}"</span>.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSendTestWhatsapp}>
                        <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 px-1">
                                    <Smartphone size={10} className="md:w-[12px] md:h-[12px]" />
                                    Recipient Phone Number
                                </label>
                                <div className="relative group">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                    <Input
                                        type="text"
                                        placeholder="+8801234567890"
                                        required
                                        value={testRecipient}
                                        onChange={e => setTestRecipient(e.target.value)}
                                        className="h-12 md:h-14 pl-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold md:text-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 px-1">
                                    <MessageCircle size={10} className="md:w-[12px] md:h-[12px]" />
                                    Message Text
                                </label>
                                <textarea
                                    className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold p-4 text-xs md:text-sm min-h-[100px] md:min-h-[120px] resize-none outline-none"
                                    placeholder="Type your test message..."
                                    required
                                    value={testMessage}
                                    onChange={e => setTestMessage(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-6 md:p-8 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsTestModalOpen(false)}
                                className="w-full md:w-auto rounded-full px-8 font-black uppercase italic tracking-tighter hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={sendingTest || !testRecipient}
                                className="w-full md:w-auto bg-gradient-to-r from-orange-400 via-orange-500 to-indigo-600 text-white rounded-full px-10 gap-2 shadow-xl shadow-indigo-500/20 font-black h-12 md:h-14 uppercase italic tracking-tighter text-base md:text-lg"
                            >
                                {sendingTest ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {sendingTest ? "Sending..." : "Execute Test"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Modal - Premium Styled */}
            <Dialog
                open={isAddModalOpen || isEditModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                    }
                }}
            >
                <DialogContent className="max-w-xl w-[95vw] rounded-[1.5rem] md:rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl bg-white dark:bg-zinc-900">
                    {/* Premium Gradient Header */}
                    <div className="bg-gradient-to-r from-orange-400 via-indigo-500 to-pink-500 p-6 md:p-10 text-white relative">
                        <Button
                            onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                            className="absolute right-4 top-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white border-0 p-0 flex items-center justify-center transition-all"
                        >
                            <X size={16} />
                        </Button>
                        <DialogTitle className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-2 uppercase italic">
                            {isAddModalOpen ? 'Connect Gateway' : 'Update Gateway'}
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-xs md:text-sm mt-1 font-bold">
                            {isAddModalOpen
                                ? 'Enter details to automate your WhatsApp messaging flow.'
                                : `Modifying configuration for gateway: ${selectedConfig?.name}`
                            }
                        </DialogDescription>
                    </div>

                    <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate}>
                        <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Gateway Name */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 px-1">Gateway Name</label>
                                    <div className="relative group">
                                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <Input
                                            placeholder="e.g. Primary WhatsApp"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="h-12 md:h-14 pl-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-bold text-base md:text-lg"
                                        />
                                    </div>
                                </div>

                                {/* Account ID */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 px-1">Account Unique ID</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-pink-500 transition-colors" size={18} />
                                        <Input
                                            placeholder="1756980378c4ca4238a0b923820dcc50..."
                                            required
                                            value={formData.account_id}
                                            onChange={e => setFormData({ ...formData, account_id: e.target.value })}
                                            className="h-12 md:h-14 pl-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 focus:border-pink-500 dark:focus:border-pink-500 transition-all font-bold font-mono text-[10px] md:text-xs"
                                        />
                                    </div>
                                </div>

                                {/* API Secret */}
                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 px-1">API Secret Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                                        <Input
                                            type="password"
                                            placeholder={isEditModalOpen ? "••••••••••••••••" : "Paste Secret Key"}
                                            required={isAddModalOpen}
                                            value={formData.api_secret}
                                            onChange={e => setFormData({ ...formData, api_secret: e.target.value })}
                                            className="h-12 md:h-14 pl-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 focus:border-orange-500 dark:focus:border-orange-500 transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Daily Limit */}
                                <div className="space-y-2">
                                    <label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400 px-1">Daily Message Limit</label>
                                    <div className="relative group">
                                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <Input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.daily_limit}
                                            onChange={e => setFormData({ ...formData, daily_limit: parseInt(e.target.value) || 0 })}
                                            className="h-12 md:h-14 pl-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-zinc-100 dark:border-zinc-800 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all font-bold text-base md:text-lg pr-12"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 font-bold">
                                            {formData.daily_limit === 0 ? '∞' : null}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Toggle Area */}
                            <div className="flex items-center justify-between p-4 md:p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-[1.2rem] md:rounded-[1.5rem] border-2 border-zinc-100 dark:border-zinc-800">
                                <div className="space-y-0.5">
                                    <h4 className="text-sm md:text-base font-black tracking-tight uppercase italic">{!formData.is_active ? 'Gateway Disabled' : 'Gateway Enabled'}</h4>
                                    <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                        Toggle to activate or deactivate this service.
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-300"
                                />
                            </div>
                        </div>

                        {/* Premium Footer */}
                        <div className="p-6 md:p-10 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                className="w-full md:w-auto rounded-full px-10 font-black uppercase italic tracking-tighter h-12 md:h-14 text-zinc-500"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full md:w-auto bg-gradient-to-r from-orange-400 via-indigo-500 to-indigo-600 text-white rounded-full px-12 gap-2 shadow-2xl shadow-indigo-500/40 font-black h-12 md:h-14 uppercase italic tracking-tighter text-lg group"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                {submitting ? "Processing..." : (isAddModalOpen ? 'Connect Gateway' : 'Save Changes')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
