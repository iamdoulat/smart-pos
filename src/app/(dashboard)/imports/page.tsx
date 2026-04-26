"use client";

import { useEffect, useState, useCallback } from "react";
import { ImportShipmentService } from "@/lib/accounting-import-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Ship,
    Box,
    Anchor,
    Truck,
    CheckCircle2,
    AlertCircle,
    Search,
    Clock,
    XCircle,
    Loader2,
    PackageCheck,
    Container,
    DollarSign,
    Trash2,
    ArrowUpRight,
    Pencil,
    User,
    Calendar,
    Hash,
    Layers,
    Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ContactService, Contact } from "@/lib/contact-service";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// ── Status Config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
    icon: React.ElementType; iconBg: string; iconText: string;
    badgeBg: string; badgeText: string; gradientFrom: string; gradientTo: string;
}> = {
    pending: {
        icon: Clock,
        iconBg: "bg-zinc-100 dark:bg-zinc-800", iconText: "text-zinc-500 dark:text-zinc-400",
        badgeBg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700", badgeText: "text-zinc-600 dark:text-zinc-400",
        gradientFrom: "from-zinc-400", gradientTo: "to-zinc-500",
    },
    shipped: {
        icon: Ship,
        iconBg: "bg-indigo-50 dark:bg-indigo-900/20", iconText: "text-indigo-500",
        badgeBg: "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-900/30", badgeText: "text-indigo-600 dark:text-indigo-400",
        gradientFrom: "from-indigo-500", gradientTo: "to-blue-500",
    },
    arrived: {
        icon: Anchor,
        iconBg: "bg-amber-50 dark:bg-amber-900/20", iconText: "text-amber-500",
        badgeBg: "bg-amber-50 dark:bg-amber-900/30 border-amber-100 dark:border-amber-900/30", badgeText: "text-amber-600 dark:text-amber-400",
        gradientFrom: "from-amber-400", gradientTo: "to-orange-500",
    },
    cleared: {
        icon: CheckCircle2,
        iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconText: "text-emerald-500",
        badgeBg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-900/30", badgeText: "text-emerald-600 dark:text-emerald-400",
        gradientFrom: "from-emerald-500", gradientTo: "to-teal-500",
    },
    cancelled: {
        icon: XCircle,
        iconBg: "bg-rose-50 dark:bg-rose-900/20", iconText: "text-rose-500",
        badgeBg: "bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-900/30", badgeText: "text-rose-600 dark:text-rose-400",
        gradientFrom: "from-rose-500", gradientTo: "to-pink-500",
    },
};

const ALL_STATUSES = ["pending", "shipped", "arrived", "cleared", "cancelled"] as const;

// ── ShipmentCard ──────────────────────────────────────────────
function ShipmentCard({ shipment, index, onDelete, onEdit }: { shipment: any; index: number; onDelete: (id: number) => void; onEdit: (s: any) => void }) {
    const cfg = STATUS_CONFIG[shipment.status] ?? STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    const shippingCost = parseFloat(shipment.total_shipping_cost ?? 0);
    const dutyCost = parseFloat(shipment.total_duty_cost ?? 0);
    const totalLandedCost = shippingCost + dutyCost;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
            className="group bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all overflow-hidden relative"
        >

            {/* Watermark */}
            <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Box size={80} />
            </div>

            <div className="p-8 pt-10 space-y-6 relative z-10">
                {/* Top row */}
                <div className="flex items-start justify-between">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500", cfg.iconBg, cfg.iconText)}>
                        <Icon size={28} strokeWidth={2} />
                    </div>
                    <div className={cn("inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", cfg.badgeBg, cfg.badgeText)}>
                        {shipment.status}
                    </div>
                </div>

                {/* Info */}
                <div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase leading-tight">
                        {shipment.container_number}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold capitalize">
                            {shipment.distribution_method} distribution
                        </p>
                    </div>
                </div>

                {/* Cost breakdown */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1">Shipping</p>
                        <p className="text-lg font-black text-zinc-800 dark:text-zinc-200">${shippingCost.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1">Duties</p>
                        <p className="text-lg font-black text-zinc-800 dark:text-zinc-200">${dutyCost.toFixed(2)}</p>
                    </div>
                </div>

                {/* Total */}
                <div className={cn("px-5 py-4 rounded-2xl flex items-center justify-between", cfg.iconBg)}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Total Landed Cost</p>
                    <p className={cn("text-lg font-black", cfg.iconText)}>${totalLandedCost.toFixed(2)}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(shipment)}
                        className="flex-1 rounded-xl h-10 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 border border-zinc-100 dark:border-zinc-700 text-xs font-black uppercase tracking-widest gap-2"
                    >
                        Edit Details <Pencil size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(shipment.id)}
                        className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-rose-600 border border-zinc-100 dark:border-zinc-700"
                    >
                        <Trash2 size={15} />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconBg, iconText, gradientFrom, gradientTo, description }: {
    label: string; value: string; icon: React.ElementType;
    iconBg: string; iconText: string; gradientFrom: string; gradientTo: string; description: string;
}) {
    let color = "indigo";
    if (gradientFrom.includes("emerald")) color = "emerald";
    else if (gradientFrom.includes("amber")) color = "amber";
    else if (gradientFrom.includes("rose")) color = "rose";
    else if (gradientFrom.includes("purple") || gradientFrom.includes("violet")) color = "purple";
    
    const gradientClasses: any = {
        indigo: "bg-gradient-to-r from-[#2B5BFF] to-[#5138EE]",
        emerald: "bg-gradient-to-r from-[#00D09E] to-[#019DA3]",
        amber: "bg-gradient-to-r from-[#FF8800] to-[#FF3B3B]",
        purple: "bg-gradient-to-r from-[#9747FF] to-[#6A0DAD]",
        rose: "bg-gradient-to-r from-[#FF3B3B] to-[#D91B1B]",
    };

    return (
        <div className={cn("rounded-xl overflow-hidden text-white transition-all duration-300 shadow-xl hover:-translate-y-1 relative group w-full", gradientClasses[color] || gradientClasses.indigo)}>
            <div className="p-5 flex flex-col justify-center h-[120px]">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[15px] uppercase font-bold tracking-wider text-white/90 drop-shadow-sm truncate">{label}</p>
                        <h3 className="text-3xl font-black tracking-tight text-white drop-shadow-md truncate">{value}</h3>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mt-1 shadow-inner border border-white/10">
                        <Icon size={16} className="text-white drop-shadow-sm" strokeWidth={2.5} />
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/90 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 shrink-0"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
                    <span className="truncate">{description}</span>
                </div>
            </div>
        </div>
    );
}

// ── Shipment Dialog ───────────────────────────────────────────
function ShipmentDialog({ open, onClose, onSuccess, companyId, shipment }: { open: boolean; onClose: () => void; onSuccess: () => void; companyId: number; shipment?: any }) {
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState<Contact[]>([]);
    const [form, setForm] = useState({
        supplier_id: "",
        container_number: "",
        status: "pending",
        distribution_method: "value",
        total_shipping_cost: "",
        total_duty_cost: "",
        bill_date: "",
        way_bill_no: "",
        quantity: "",
        cad_amount: "",
        gst_amount: "",
        remarks: "",
    });

    useEffect(() => {
        if (open) {
            loadVendors();
            if (shipment) {
                setForm({
                    supplier_id: shipment.supplier_id?.toString() || "",
                    container_number: shipment.container_number || "",
                    status: shipment.status || "pending",
                    distribution_method: shipment.distribution_method || "value",
                    total_shipping_cost: shipment.total_shipping_cost?.toString() || "",
                    total_duty_cost: shipment.total_duty_cost?.toString() || "",
                    bill_date: shipment.bill_date || "",
                    way_bill_no: shipment.way_bill_no || "",
                    quantity: shipment.quantity?.toString() || "",
                    cad_amount: shipment.cad_amount?.toString() || "",
                    gst_amount: shipment.gst_amount?.toString() || "",
                    remarks: shipment.remarks || "",
                });
            } else {
                setForm({
                    supplier_id: "",
                    container_number: "",
                    status: "pending",
                    distribution_method: "value",
                    total_shipping_cost: "",
                    total_duty_cost: "",
                    bill_date: new Date().toISOString().split('T')[0],
                    way_bill_no: "",
                    quantity: "",
                    cad_amount: "",
                    gst_amount: "",
                    remarks: "",
                });
            }
        }
    }, [open, shipment]);

    const loadVendors = async () => {
        try {
            const data = await ContactService.getAll(companyId);
            setVendors(data.filter((c: Contact) => c.type === 'vendor'));
        } catch (error) {
            console.error("Failed to load vendors", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                company_id: companyId,
                total_shipping_cost: parseFloat(form.total_shipping_cost) || 0,
                total_duty_cost: parseFloat(form.total_duty_cost) || 0,
                cad_amount: parseFloat(form.cad_amount) || 0,
                gst_amount: parseFloat(form.gst_amount) || 0,
                quantity: parseInt(form.quantity) || 0,
                supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
            };

            if (shipment) {
                await ImportShipmentService.update(shipment.id, payload);
                toast.success("Shipment updated successfully");
            } else {
                await ImportShipmentService.create(payload);
                toast.success("Shipment created successfully");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-0 overflow-hidden max-w-2xl">
                <div className="p-8 md:p-10 space-y-8 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase leading-none">
                            {shipment ? "Edit Shipment" : "New Shipment"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* ── Primary Details ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                                    <Container size={12} /> Container Number
                                </Label>
                                <Input
                                    value={form.container_number}
                                    onChange={e => setForm({ ...form, container_number: e.target.value })}
                                    placeholder="e.g. MSCU7654321"
                                    required
                                    className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono tracking-widest text-lg"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                                    <User size={12} /> Supplier
                                </Label>
                                <Select value={form.supplier_id} onValueChange={v => setForm({ ...form, supplier_id: v })}>
                                    <SelectTrigger className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold px-4">
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-2">
                                        {vendors.map(v => (
                                            <SelectItem key={v.id} value={v.id.toString()} className="rounded-xl h-10 font-bold focus:bg-indigo-600 focus:text-white">
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* ── Logistics ── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3 md:col-span-1">
                                <Label className="flex items-center gap-2 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                                    <Calendar size={12} /> Bill Date
                                </Label>
                                <Input
                                    type="date"
                                    value={form.bill_date}
                                    onChange={e => setForm({ ...form, bill_date: e.target.value })}
                                    className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                                />
                            </div>
                            <div className="space-y-3 md:col-span-1">
                                <Label className="flex items-center gap-2 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                                    <Hash size={12} /> Waybill No.
                                </Label>
                                <Input
                                    value={form.way_bill_no}
                                    onChange={e => setForm({ ...form, way_bill_no: e.target.value })}
                                    placeholder="WBN-99228"
                                    className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                                />
                            </div>
                            <div className="space-y-3 md:col-span-1">
                                <Label className="flex items-center gap-2 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                                    <Layers size={12} /> Quantity
                                </Label>
                                <Input
                                    type="number"
                                    value={form.quantity}
                                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                                    placeholder="0"
                                    className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
                                />
                            </div>
                        </div>

                        {/* ── Financials ── */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">CAD Amount</Label>
                                <Input type="number" step="0.01" value={form.cad_amount} onChange={e => setForm({ ...form, cad_amount: e.target.value })} placeholder="0.00" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-black" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">GST</Label>
                                <Input type="number" step="0.01" value={form.gst_amount} onChange={e => setForm({ ...form, gst_amount: e.target.value })} placeholder="0.00" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-100 dark:text-zinc-100 font-black" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Shipping ($)</Label>
                                <Input type="number" step="0.01" value={form.total_shipping_cost} onChange={e => setForm({ ...form, total_shipping_cost: e.target.value })} placeholder="0.00" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 font-black" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Duty ($)</Label>
                                <Input type="number" step="0.01" value={form.total_duty_cost} onChange={e => setForm({ ...form, total_duty_cost: e.target.value })} placeholder="0.00" className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400 font-black" />
                            </div>
                        </div>

                        {/* ── Status & Distribution ── */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Status</Label>
                                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                    <SelectTrigger className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-2">
                                        {ALL_STATUSES.map(s => (
                                            <SelectItem key={s} value={s} className="rounded-xl h-10 font-bold capitalize focus:bg-indigo-600 focus:text-white">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">Distribution</Label>
                                <Select value={form.distribution_method} onValueChange={v => setForm({ ...form, distribution_method: v })}>
                                    <SelectTrigger className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 rounded-xl p-2">
                                        <SelectItem value="value" className="rounded-xl h-10 font-bold focus:bg-indigo-600 focus:text-white">By Value</SelectItem>
                                        <SelectItem value="quantity" className="rounded-xl h-10 font-bold focus:bg-indigo-600 focus:text-white">By Quantity</SelectItem>
                                        <SelectItem value="weight" className="rounded-xl h-10 font-bold focus:bg-indigo-600 focus:text-white">By Weight</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em]">
                                <Receipt size={12} /> Remarks
                            </Label>
                            <Input
                                value={form.remarks}
                                onChange={e => setForm({ ...form, remarks: e.target.value })}
                                placeholder="Additional details..."
                                className="h-14 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                            />
                        </div>

                        <DialogFooter className="gap-4 pt-4">
                            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-14 px-8 font-black text-xs uppercase tracking-[0.15em] text-zinc-500">Cancel</Button>
                            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-orange-400 to-indigo-500 text-white rounded-full h-14 px-8 font-black text-lg shadow-[0_8px_20px_-6px_rgba(251,146,60,0.5)] transition-all hover:scale-[1.02] active:scale-95 border-0 flex items-center justify-center gap-2">
                                {loading ? <Loader2 size={20} className="animate-spin" /> : shipment ? <Pencil size={18} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                                {loading ? "Saving..." : shipment ? "Update Shipment" : "Add Shipment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ImportsPage() {
    const { currentCompany } = useAuthStore();
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const loadShipments = useCallback(async () => {
        if (!currentCompany) return;
        try {
            const data = await ImportShipmentService.getAll(currentCompany.id);
            setShipments(data);
        } catch (error) {
            console.error("Failed to load shipments", error);
        } finally {
            setLoading(false);
        }
    }, [currentCompany]);

    useEffect(() => {
        loadShipments();
    }, [loadShipments]);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/import-shipments/${id}`);
            toast.success("Shipment removed");
            setShipments(prev => prev.filter(s => s.id !== id));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to remove shipment");
        }
    };

    const totalShipping = shipments.reduce((sum, s) => sum + parseFloat(s.total_shipping_cost ?? 0), 0);
    const totalDuties = shipments.reduce((sum, s) => sum + parseFloat(s.total_duty_cost ?? 0), 0);
    const activeShipments = shipments.filter(s => ["shipped", "arrived"].includes(s.status)).length;

    const filtered = shipments.filter(s => {
        const matchStatus = !selectedStatus || s.status === selectedStatus;
        const matchSearch = !searchQuery || s.container_number?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchSearch;
    });

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                    <p className="text-zinc-500 font-bold text-sm tracking-tight">Loading shipments...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform rotate-3 hover:rotate-0 transition-transform">
                        <Container size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-indigo-500 via-blue-600 to-violet-500 bg-clip-text text-transparent tracking-tighter uppercase leading-none mb-2">
                            Import &amp; Shipping
                        </h2>
                        <p className="text-xs md:text-base text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            Track containers and manage landed cost distributions.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowNewDialog(true)}
                    className="bg-gradient-to-r from-orange-400 to-indigo-500 text-white rounded-full px-8 h-14 font-black text-lg shadow-[0_8px_20px_-6px_rgba(251,146,60,0.5)] transition-all hover:scale-[1.02] active:scale-95 border-0 whitespace-nowrap gap-2"
                >
                    <Plus size={20} strokeWidth={3} /> Add Shipment
                </Button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Active Shipments"
                    value={`${activeShipments} In Motion`}
                    icon={Ship}
                    iconBg="bg-indigo-50 dark:bg-indigo-900/20"
                    iconText="text-indigo-500 dark:text-indigo-400"
                    gradientFrom="from-indigo-500"
                    gradientTo="to-blue-500"
                    description="Shipments currently in transit or arrived and awaiting clearance."
                />
                <StatCard
                    label="Total Freight Cost"
                    value={`$${totalShipping.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                    icon={Truck}
                    iconBg="bg-amber-50 dark:bg-amber-900/20"
                    iconText="text-amber-500 dark:text-amber-400"
                    gradientFrom="from-amber-400"
                    gradientTo="to-orange-500"
                    description="Cumulative shipping costs across all import shipments."
                />
                <StatCard
                    label="Total Duty & Tax"
                    value={`$${totalDuties.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    iconBg="bg-emerald-50 dark:bg-emerald-900/20"
                    iconText="text-emerald-500 dark:text-emerald-400"
                    gradientFrom="from-emerald-500"
                    gradientTo="to-teal-500"
                    description="Cumulative customs duty and import tax obligations."
                />
            </div>

            {/* ── Search & Status Filter ── */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 flex items-center gap-4 bg-white dark:bg-zinc-900/50 p-2 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <Input
                            placeholder="Search by container number..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none py-7 pl-16 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-medium"
                        />
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {ALL_STATUSES.map(s => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                            <button
                                key={s}
                                onClick={() => setSelectedStatus(prev => prev === s ? null : s)}
                                className={cn(
                                    "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                                    selectedStatus === s
                                        ? cn(cfg.badgeBg, cfg.badgeText, "ring-2 ring-offset-1 ring-indigo-500/30")
                                        : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300"
                                )}
                            >
                                {s}
                            </button>
                        );
                    })}
                    {selectedStatus && (
                        <button onClick={() => setSelectedStatus(null)} className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 text-indigo-500 hover:text-indigo-700 transition-all">
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* ── Shipment Cards ── */}
            {filtered.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((shipment, index) => (
                            <ShipmentCard
                                key={shipment.id}
                                shipment={shipment}
                                index={index}
                                onDelete={handleDelete}
                                onEdit={(s) => {
                                    setSelectedShipment(s);
                                    setShowNewDialog(true);
                                }}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col items-center gap-6 py-24">
                        <div className="h-20 w-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                            <Ship size={40} className="text-indigo-400" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                                {shipments.length === 0 ? "No Active Shipments" : "No Matching Shipments"}
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-xs mx-auto font-medium">
                                {shipments.length === 0
                                    ? "Create a shipment to track containers from vessel to warehouse and distribute landed costs."
                                    : "Try adjusting your search or status filter."}
                            </p>
                        </div>
                        {shipments.length === 0 && (
                            <Button
                                onClick={() => setShowNewDialog(true)}
                                className="bg-gradient-to-r from-orange-400 to-indigo-500 text-white rounded-full px-10 h-14 font-black text-lg shadow-[0_8px_20px_-6px_rgba(251,146,60,0.5)] transition-all hover:scale-[1.02] active:scale-95 border-0 gap-2"
                            >
                                <Plus size={20} strokeWidth={3} /> Add First Shipment
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Footer ── */}
            <div className="pt-10 flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                    Global Logistics Module
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    v2.1.0 • CBSA Compliant Landed Cost Engine
                </p>
            </div>

            {/* ── Dialog ── */}
            {currentCompany && (
                <ShipmentDialog
                    open={showNewDialog}
                    shipment={selectedShipment}
                    onClose={() => {
                        setShowNewDialog(false);
                        setSelectedShipment(null);
                    }}
                    onSuccess={loadShipments}
                    companyId={currentCompany.id}
                />
            )}
        </div>
    );
}
