"use client";

import { useState, useEffect, useCallback } from "react";
import {
    ShieldCheck,
    Shield,
    Check,
    Loader2,
    Lock,
    ChevronLeft
} from "lucide-react";
import { useTranslation } from "@/i18n/TranslationContext";
import { RoleService, Role } from "@/lib/role-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter, useParams } from "next/navigation";

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

export default function EditRolePage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const fetchRole = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await RoleService.getRole(Number(id));
            setRole(data);
            setSelectedPermissions(data.permissions || []);
        } catch (error) {
            toast.error(t("roles.error_load") || "Failed to load role");
            router.push("/settings/roles");
        } finally {
            setLoading(false);
        }
    }, [id, t, router]);

    useEffect(() => {
        fetchRole();
    }, [fetchRole]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!role) return;
        
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;

        try {
            await RoleService.updateRole(role.id, {
                name,
                permissions: selectedPermissions,
            });
            toast.success(t("roles.success_save"));
            router.push("/settings/roles");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Something went wrong";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePermission = (id: string) => {
        setSelectedPermissions(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                <p className="text-zinc-500 font-bold tracking-tight">{t("common.loading")}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => router.back()}
                    className="h-12 w-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    <ChevronLeft size={24} />
                </Button>
                <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
                        {t("roles.edit_role")}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                        {role?.name} — {t("roles.subtitle")}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden shadow-indigo-500/5">
                    {/* Role Identity Section */}
                    <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
                        <div className="space-y-4">
                            <Label htmlFor="name" className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">
                                {t("roles.role_name")}
                            </Label>
                            <div className="relative">
                                <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={24} />
                                <Input 
                                    id="name" 
                                    name="name" 
                                    defaultValue={role?.name} 
                                    placeholder="e.g. Sales Manager" 
                                    className="pl-14 h-16 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xl transition-all" 
                                    required 
                                    disabled={role?.name === "Admin"}
                                />
                            </div>
                            {role?.name === "Admin" && (
                                <div className="flex items-center gap-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 font-bold text-sm">
                                    <Lock size={18} />
                                    {t("roles.admin_locked")}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="p-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">
                                    {t("roles.permissions")}
                                </Label>
                                <p className="text-xs text-zinc-400 font-bold italic">
                                    {selectedPermissions.length} of {ALL_PERMISSIONS.length} areas selected
                                </p>
                            </div>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full px-6 font-black uppercase tracking-widest text-[10px] h-10 border-indigo-100 text-indigo-600 hover:bg-indigo-50"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ALL_PERMISSIONS.map((perm) => (
                                <div 
                                    key={perm.id}
                                    onClick={() => togglePermission(perm.id)}
                                    className={cn(
                                        "flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all duration-300 cursor-pointer group relative overflow-hidden",
                                        selectedPermissions.includes(perm.id)
                                            ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/5 shadow-lg shadow-indigo-500/5"
                                            : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-zinc-50/30 dark:bg-zinc-950"
                                    )}
                                >
                                    <div className={cn(
                                        "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300",
                                        selectedPermissions.includes(perm.id)
                                            ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/30"
                                            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700"
                                    )}>
                                        {selectedPermissions.includes(perm.id) ? <Check size={18} strokeWidth={4} /> : <div className="h-1.5 w-1.5 rounded-full bg-zinc-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <span className={cn(
                                            "text-base font-bold tracking-tight transition-colors",
                                            selectedPermissions.includes(perm.id) ? "text-indigo-900 dark:text-indigo-100" : "text-zinc-500 dark:text-zinc-400"
                                        )}>
                                            {t(perm.label)}
                                        </span>
                                    </div>
                                    {selectedPermissions.includes(perm.id) && (
                                        <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-10 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-5">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => router.back()} 
                            className="rounded-full px-10 font-black uppercase tracking-widest text-xs h-16 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        >
                            {t("common.discard")}
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 text-white rounded-full px-16 gap-3 shadow-2xl shadow-indigo-500/30 font-black uppercase tracking-widest text-xs h-16 hover:scale-105 active:scale-95 transition-all"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    <ShieldCheck size={20} />
                                    {t("roles.save_role")}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
