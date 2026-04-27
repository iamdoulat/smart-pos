"use client";

import { useState, useEffect, useCallback } from "react";
import {
    ShieldCheck,
    Plus,
    Search,
    MoreHorizontal,
    Edit2,
    Trash2,
    Shield,
    X,
    Check,
    Loader2,
    Lock
} from "lucide-react";
import { useTranslation } from "@/i18n/TranslationContext";
import { RoleService, Role } from "@/lib/role-service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const ALL_PERMISSIONS = [
    { id: "view dashboard", label: "roles.permission_dashboard" },
    { id: "manage inventory", label: "roles.permission_inventory" },
    { id: "manage sales", label: "roles.permission_sales" },
    { id: "manage purchases", label: "roles.permission_purchases" },
    { id: "manage contacts", label: "roles.permission_contacts" },
    { id: "manage bank", label: "roles.permission_bank" },
    { id: "manage accounts", label: "roles.permission_accounts" },
    { id: "manage imports", label: "roles.permission_imports" },
    { id: "manage reports", label: "roles.permission_reports" },
    { id: "manage system settings", label: "roles.permission_settings" },
];

export default function RolesSettingsPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const { t } = useTranslation();
    const router = useRouter();

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await RoleService.getAllRoles();
            setRoles(data);
        } catch (error) {
            toast.error(t("roles.error_load") || "Failed to load roles");
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;

        try {
            const data = {
                name,
                permissions: selectedPermissions,
            };

            if (currentRole) {
                await RoleService.updateRole(currentRole.id, data);
                toast.success(t("roles.success_save"));
            } else {
                await RoleService.createRole(data);
                toast.success(t("roles.success_save"));
            }
            setIsFormOpen(false);
            fetchRoles();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Something went wrong";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsSubmitting(true);
        try {
            await RoleService.deleteRole(deleteId);
            toast.success(t("roles.success_delete"));
            setDeleteId(null);
            setIsDeleting(false);
            fetchRoles();
        } catch (error) {
            toast.error(t("roles.error_delete"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePermission = (id: string) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full p-4 md:p-6 space-y-6 pt-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">{t("roles.title")}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("roles.subtitle")}</p>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setCurrentRole(null);
                        setSelectedPermissions([]);
                        setIsFormOpen(true);
                    }}
                    className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-6 gap-2 shadow-lg shadow-orange-500/20 py-6"
                >
                    <Plus size={18} />
                    <span className="font-bold">{t("roles.new_role")}</span>
                </Button>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <Input
                        placeholder={t("common.search")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-amber-500"
                    />
                </div>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="animate-spin mx-auto mb-4 text-indigo-500" size={40} />
                        <p className="text-zinc-500 font-medium">{t("common.loading")}</p>
                    </div>
                ) : filteredRoles.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <Shield className="mx-auto mb-4 text-zinc-300" size={48} />
                        <p className="text-zinc-500 font-medium">{t("common.no_results")}</p>
                    </div>
                ) : (
                    filteredRoles.map((role) => (
                        <div key={role.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 group overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                                        {role.name.charAt(0).toUpperCase()}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                <MoreHorizontal size={18} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 p-1 rounded-2xl shadow-2xl border-zinc-100 dark:border-zinc-800">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    if (role.name === "Admin") {
                                                        toast.error(t("roles.admin_locked"));
                                                        return;
                                                    }
                                                    router.push(`/settings/roles/${role.id}/edit`);
                                                }}
                                                className="gap-3 rounded-xl cursor-pointer py-2.5"
                                            >
                                                <Edit2 size={16} className="text-indigo-500" />
                                                <span className="font-bold text-sm">{t("roles.edit_role")}</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    if (role.name === "Admin") {
                                                        toast.error(t("roles.admin_locked"));
                                                        return;
                                                    }
                                                    setDeleteId(role.id);
                                                    setIsDeleting(true);
                                                }}
                                                className="gap-3 rounded-xl cursor-pointer text-red-600 focus:text-red-600 py-2.5"
                                            >
                                                <Trash2 size={16} />
                                                <span className="font-bold text-sm">{t("roles.delete_role")}</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-indigo-600 transition-colors">{role.name}</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                        {role.name === "Admin" ? "System Core" : "User Defined"}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t("roles.permissions")}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {role.permissions?.slice(0, 4).map((p) => (
                                            <span key={typeof p === 'string' ? p : p.id} className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-800/50">
                                                {t(ALL_PERMISSIONS.find(perm => perm.id === (typeof p === 'string' ? p : p.name))?.label || (typeof p === 'string' ? p : p.name))}
                                            </span>
                                        ))}
                                        {role.permissions?.length > 4 && (
                                            <span className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold">
                                                +{role.permissions.length - 4}
                                            </span>
                                        )}
                                        {(!role.permissions || role.permissions.length === 0) && (
                                            <span className="text-zinc-400 italic text-xs">{t("common.no_data")}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {role.users && role.users.length > 0 ? (
                                        <>
                                            {role.users.map((u, i) => (
                                                <div key={i} title={u.name} className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                            {(role.users_count || 0) > 3 && (
                                                <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                                                    +{(role.users_count || 0) - 3}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] text-zinc-400">
                                            -
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-zinc-400 italic">{t("common.active")}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
                    <form onSubmit={handleSave}>
                        <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-8 text-white">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-extrabold tracking-tight">
                                        {currentRole ? t("roles.edit_role") : t("roles.new_role")}
                                    </DialogTitle>
                                    <DialogDescription className="text-white/80 font-medium">
                                        {t("roles.subtitle")}
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 bg-white dark:bg-zinc-900 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">{t("roles.role_name")}</Label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                                    <Input 
                                        id="name" 
                                        name="name" 
                                        defaultValue={currentRole?.name} 
                                        placeholder="e.g. Sales Manager" 
                                        className="pl-12 h-14 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold focus:ring-amber-500 text-lg shadow-inner" 
                                        required 
                                        disabled={currentRole?.name === "Admin"}
                                    />
                                </div>
                                {currentRole?.name === "Admin" && (
                                    <p className="text-xs text-amber-600 font-bold flex items-center gap-2 mt-2">
                                        <Lock size={12} /> {t("roles.admin_locked")}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">{t("roles.permissions")}</Label>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50"
                                        onClick={() => {
                                            if (selectedPermissions.length === ALL_PERMISSIONS.length) {
                                                setSelectedPermissions([]);
                                            } else {
                                                setSelectedPermissions(ALL_PERMISSIONS.map(p => p.id));
                                            }
                                        }}
                                    >
                                        {selectedPermissions.length === ALL_PERMISSIONS.length ? "Deselect All" : "Select All"}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {ALL_PERMISSIONS.map((perm) => (
                                        <div 
                                            key={perm.id}
                                            onClick={() => togglePermission(perm.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer group",
                                                selectedPermissions.includes(perm.id)
                                                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
                                                    : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-6 w-6 rounded-lg flex items-center justify-center transition-colors",
                                                selectedPermissions.includes(perm.id)
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 group-hover:bg-zinc-300"
                                            )}>
                                                {selectedPermissions.includes(perm.id) && <Check size={14} strokeWidth={4} />}
                                            </div>
                                            <span className={cn(
                                                "text-sm font-bold tracking-tight",
                                                selectedPermissions.includes(perm.id) ? "text-indigo-700 dark:text-indigo-400" : "text-zinc-600 dark:text-zinc-400"
                                            )}>
                                                {t(perm.label)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4">
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded-full px-8 font-black uppercase tracking-widest text-xs h-14">
                                {t("common.discard")}
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-12 gap-3 shadow-xl shadow-orange-500/20 font-black uppercase tracking-widest text-xs h-14 hover:scale-105 active:scale-95 transition-transform">
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (currentRole ? t("roles.save_role") : t("roles.save_role"))}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-0 overflow-hidden max-w-sm">
                    <div className="bg-red-500 p-8 text-white text-center">
                        <div className="h-16 w-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight">{t("common.are_you_sure")}</h3>
                    </div>
                    <div className="p-8 text-center bg-white dark:bg-zinc-900">
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed">
                            {t("roles.delete_confirm")}
                        </p>
                    </div>
                    <div className="p-8 pt-0 flex flex-col gap-3 bg-white dark:bg-zinc-900">
                        <Button
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/30"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                            {t("roles.delete_role")}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleting(false)}
                            className="w-full rounded-full h-14 font-black uppercase tracking-widest text-xs text-zinc-400 hover:bg-zinc-100"
                        >
                            {t("common.cancel")}
                        </Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
