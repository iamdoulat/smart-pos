"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "next-themes";
import { User, KeyRound, Palette, Save, Eye, EyeOff, Sun, Moon, Monitor, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/auth-service";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/TranslationContext";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, "Current password is required"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ─── Tab Config ───────────────────────────────────────────────────────────────

const getTabs = (t: any) => [
    { id: "profile", label: t('settings.tab_profile') || "Profile", icon: User },
    { id: "password", label: t('settings.tab_password') || "Password", icon: KeyRound },
    { id: "appearance", label: t('settings.tab_appearance') || "Appearance", icon: Palette },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("profile");
    const tabs = getTabs(t);

    return (
        <div className="w-full p-4 md:p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('settings.title')}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {t('settings.subtitle')}
                </p>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === tab.id
                                ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                        )}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "password" && <PasswordTab />}
            {activeTab === "appearance" && <AppearanceTab />}
        </div>
    );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
    const { t } = useTranslation();
    const { user, setUser } = useAuthStore();
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name ?? "",
            email: user?.email ?? "",
        },
    });

    const onSubmit = async (data: ProfileForm) => {
        setSaving(true);
        try {
            const updated = await AuthService.updateProfile(data);
            setUser(updated);
            toast.success(t('settings.success_profile_update') || "Profile updated successfully!");
        } catch (err: any) {
            const msg = err?.response?.data?.message || t('settings.error_profile_update') || "Failed to update profile.";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-zinc-900 dark:text-zinc-100">{t('settings.profile_title')}</CardTitle>
                <CardDescription>{t('settings.profile_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow">
                        {initials}
                    </div>
                    <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{user?.name ?? "—"}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email ?? "—"}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="name">{t('settings.full_name')}</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            {...register("name")}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">{t('settings.email_address')}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            {...register("email")}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            <Save size={15} />
                            {saving ? t('settings.saving') : t('settings.save_changes')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Password Tab ─────────────────────────────────────────────────────────────

function PasswordTab() {
    const { t } = useTranslation();
    const [saving, setSaving] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    });

    const onSubmit = async (data: PasswordForm) => {
        setSaving(true);
        try {
            await AuthService.updatePassword(data);
            toast.success(t('settings.success_password_change') || "Password changed successfully!");
            reset();
        } catch (err: any) {
            const msg = err?.response?.data?.message || t('settings.error_password_update') || "Failed to update password.";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-zinc-900 dark:text-zinc-100">{t('settings.password_title')}</CardTitle>
                <CardDescription>{t('settings.password_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="current_password">{t('settings.current_password')}</Label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                type={showCurrent ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("current_password")}
                                className={cn("pr-10", errors.current_password ? "border-red-500" : "")}
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.current_password && <p className="text-xs text-red-500">{errors.current_password.message}</p>}
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password">{t('settings.new_password')}</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showNew ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                                className={cn("pr-10", errors.password ? "border-red-500" : "")}
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation">{t('settings.confirm_password')}</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password_confirmation")}
                                className={cn("pr-10", errors.password_confirmation ? "border-red-500" : "")}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password_confirmation && <p className="text-xs text-red-500">{errors.password_confirmation.message}</p>}
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            <Save size={15} />
                            {saving ? t('settings.updating') : t('settings.update_password')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────

const getThemes = (t: any) => [
    { id: "light", label: t('settings.theme_light') || "Light", icon: Sun, description: t('settings.theme_light_desc') || "Clean and bright interface" },
    { id: "dark", label: t('settings.theme_dark') || "Dark", description: t('settings.theme_dark_desc') || "Easy on the eyes at night", icon: Moon },
    { id: "system", label: t('settings.theme_system') || "System", description: t('settings.theme_system_desc') || "Follows your OS preference", icon: Monitor },
];

function AppearanceTab() {
    const { t } = useTranslation();
    const themes = getThemes(t);
    const { theme, setTheme } = useTheme();

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-zinc-900 dark:text-zinc-100">{t('settings.appearance_title')}</CardTitle>
                <CardDescription>{t('settings.appearance_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {themes.map((t) => {
                    const isActive = theme === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200",
                                isActive
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/40"
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                                isActive
                                    ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                            )}>
                                <t.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <p className={cn("font-semibold", isActive ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-800 dark:text-zinc-200")}>
                                    {t.label}
                                </p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.description}</p>
                            </div>
                            {isActive && <CheckCircle2 size={20} className="text-indigo-500 shrink-0" />}
                        </button>
                    );
                })}
            </CardContent>
        </Card>
    );
}
