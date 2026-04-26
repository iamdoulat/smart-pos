"use client";

import { useState, useEffect, useCallback } from "react";
import { WarehouseService, Warehouse } from "@/lib/warehouse-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    Building2,
    Mail,
    Phone,
    Building,
    X,
    Check,
    Loader2,
    ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function WarehousesPage() {
    const { currentCompany } = useAuthStore();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    /* Drawer state */
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        mobile: "",
        email: "",
        status: "Active" as "Active" | "Inactive",
    });

    const fetchWarehouses = useCallback(async () => {
        if (!currentCompany) return;
        try {
            setLoading(true);
            const data = await WarehouseService.getAll(currentCompany.id);
            setWarehouses(data);
        } catch (error) {
            toast.error("Failed to fetch warehouses");
        } finally {
            setLoading(false);
        }
    }, [currentCompany]);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const handleOpenDrawer = (warehouse?: Warehouse) => {
        if (warehouse) {
            setEditingWarehouse(warehouse);
            setForm({
                name: warehouse.name,
                mobile: warehouse.mobile || "",
                email: warehouse.email || "",
                status: warehouse.status,
            });
        } else {
            setEditingWarehouse(null);
            setForm({
                name: "",
                mobile: "",
                email: "",
                status: "Active",
            });
        }
        setDrawerOpen(true);
    };

    const handleSave = async () => {
        if (!currentCompany) return;
        if (!form.name.trim()) {
            toast.error("Warehouse name is required");
            return;
        }

        setSaving(true);
        try {
            if (editingWarehouse) {
                await WarehouseService.update(editingWarehouse.id, form);
                toast.success("Warehouse updated successfully");
            } else {
                await WarehouseService.create({ ...form, company_id: currentCompany.id });
                toast.success("Warehouse created successfully");
            }
            setDrawerOpen(false);
            fetchWarehouses();
        } catch (error) {
            toast.error("Failed to save warehouse");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await WarehouseService.delete(id);
            toast.success("Warehouse deleted successfully");
            fetchWarehouses();
        } catch (error) {
            toast.error("Failed to delete warehouse");
        }
    };

    const filteredWarehouses = warehouses.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.mobile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 transform rotate-3">
                        <Building2 size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-orange-500 via-red-600 to-pink-500 bg-clip-text text-transparent tracking-tighter uppercase leading-none mb-1">
                            Warehouse List
                        </h2>
                        <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            Manage your storage locations and inventory distribution.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={16} />
                        <Input
                            placeholder="Find warehouse…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 w-48 md:w-64 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium text-sm"
                        />
                    </div>
                    <Button
                        onClick={() => handleOpenDrawer()}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full px-6 h-11 font-bold transition-all hover:scale-[1.02] active:scale-95 border-0 shadow-lg"
                    >
                        <Plus size={18} className="mr-2" /> New Warehouse
                    </Button>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                            <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800">
                                <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Warehouse Name</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Mobile</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Email</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Details</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Status</TableHead>
                                <TableHead className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-left w-[120px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="px-6 py-20 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredWarehouses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-6 py-20 text-center text-zinc-400 font-medium">
                                        No warehouses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredWarehouses.map((warehouse) => (
                                    <TableRow key={warehouse.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-none">
                                        <TableCell className="px-6 py-4 font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                                                    <Building size={16} className="text-orange-600" />
                                                </div>
                                                {warehouse.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                                            {warehouse.mobile || <span className="opacity-30">N/A</span>}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-medium">
                                            {warehouse.email || <span className="opacity-30">N/A</span>}
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="space-y-1 py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 min-w-[180px]">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                                                    <span>Total Items:</span>
                                                    <span className="text-zinc-900 dark:text-zinc-100">{warehouse.total_items ?? 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                                                    <span>Available Quantity:</span>
                                                    <span className="text-zinc-900 dark:text-zinc-100">{Number(warehouse.total_quantity ?? 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500">
                                                    <span>Worth:</span>
                                                    <span className="text-zinc-900 dark:text-zinc-100">$ {Number(warehouse.total_worth ?? 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                                                warehouse.status === "Active"
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                            )}>
                                                {warehouse.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="default" className="bg-[#4192B3] hover:bg-[#367a96] text-white rounded-md h-9 px-4 flex items-center gap-2 font-bold text-xs uppercase border-0">
                                                        Action <ChevronDown size={14} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-2 min-w-[140px]">
                                                    <DropdownMenuItem
                                                        onClick={() => handleOpenDrawer(warehouse)}
                                                        className="rounded-lg h-10 gap-3 font-bold text-xs uppercase tracking-tighter cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                                    >
                                                        <Edit2 size={14} className="text-orange-500" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <div className="flex items-center gap-3 px-2 py-2 rounded-lg font-bold text-xs uppercase tracking-tighter cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors">
                                                                <Trash2 size={14} /> Delete
                                                            </div>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-0 overflow-hidden">
                                                            <div className="bg-red-500 p-8 text-white">
                                                                <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4"><Trash2 size={28} /></div>
                                                                <AlertDialogTitle className="text-2xl font-bold tracking-tight uppercase leading-none">Delete Warehouse?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-red-50 mt-2 font-medium">Permanently remove <span className="font-bold underline">{warehouse.name}</span>.</AlertDialogDescription>
                                                            </div>
                                                            <AlertDialogFooter className="p-6 bg-white dark:bg-zinc-950 gap-3">
                                                                <AlertDialogCancel className="rounded-full border-zinc-200 font-bold px-8 h-12">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(warehouse.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-10 h-12 border-0">Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Drawer ── */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                    <div className="relative ml-auto h-full w-full max-w-sm bg-white dark:bg-zinc-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="h-1.5 bg-gradient-to-r from-orange-400 via-red-500 to-pink-600" />
                        <div className="p-8 space-y-8 flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black tracking-tighter uppercase leading-none bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                                    {editingWarehouse ? "Edit Warehouse" : "New Warehouse"}
                                </h3>
                                <button onClick={() => setDrawerOpen(false)} className="h-8 w-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400"><X size={20} /></button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest leading-none">Warehouse Name *</label>
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                        <Input
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="pl-12 rounded-2xl h-12 bg-zinc-50 dark:bg-zinc-900 border-transparent focus:border-orange-500/50"
                                            placeholder="e.g. MAIN STORAGE"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest leading-none">Mobile</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                        <Input
                                            value={form.mobile}
                                            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                            className="pl-12 rounded-2xl h-12 bg-zinc-50 dark:bg-zinc-900 border-transparent focus:border-orange-500/50"
                                            placeholder="Contact number"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest leading-none">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                        <Input
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="pl-12 rounded-2xl h-12 bg-zinc-50 dark:bg-zinc-900 border-transparent focus:border-orange-500/50"
                                            placeholder="Email address"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest leading-none">Status</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['Active', 'Inactive'] as const).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setForm({ ...form, status: s })}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                                                    form.status === s
                                                        ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/20"
                                                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500"
                                                )}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full rounded-2xl h-14 font-black bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 text-white border-0 shadow-xl shadow-red-500/25 uppercase tracking-tighter hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                            >
                                {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Check className="h-5 w-5" />}
                                {editingWarehouse ? "Save Changes" : "Create Warehouse"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
