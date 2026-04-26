"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "next-themes";
import { User, KeyRound, Palette, Save, Eye, EyeOff, Sun, Moon, Monitor, CheckCircle2, Upload, Loader2 } from "lucide-react";
import { cn, getAssetUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/lib/auth-service";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: KeyRound },
    { id: "appearance", label: "Appearance", icon: Palette },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">Account Profile</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage your personal account settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-full h-12 shadow-sm w-fit">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="rounded-full px-6 gap-2 data-[state=active]:bg-gradient-to-r from-amber-500 to-indigo-600 data-[state=active]:text-white font-bold transition-all duration-300"
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="profile" className="mt-0 focus-visible:ring-0">
                    <ProfileTab />
                </TabsContent>
                <TabsContent value="password" className="mt-0 focus-visible:ring-0">
                    <PasswordTab />
                </TabsContent>
                <TabsContent value="appearance" className="mt-0 focus-visible:ring-0">
                    <AppearanceTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
    const { user, setUser } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name ?? "",
            email: user?.email ?? "",
        },
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProfileForm) => {
        setSaving(true);
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);

        const avatarFile = avatarInputRef.current?.files?.[0];
        if (avatarFile) {
            formData.append("avatar", avatarFile);
        }

        try {
            const response = await AuthService.updateProfile(formData);
            const updatedUser = response.user || response;
            setUser(updatedUser);
            toast.success("Profile updated successfully!");
            setPreview(null);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to update profile.";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    const avatarUrl = preview || (user?.avatar_url ? getAssetUrl(user.avatar_url) : null);
    console.log("Avatar Debug:", { 
        raw: user?.avatar_url, 
        processed: avatarUrl,
        preview: !!preview 
    });

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-zinc-900 dark:text-zinc-100">Profile Information</CardTitle>
                <CardDescription>Update your name and email address.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-500 via-indigo-600 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center text-white backdrop-blur-[2px]"
                        >
                            <Upload size={24} />
                        </button>
                        <input
                            type="file"
                            ref={avatarInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-lg leading-tight">{user?.name ?? "—"}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{user?.email ?? "—"}</p>
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-indigo-600 dark:text-indigo-400 font-bold text-xs"
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            Change Profile Photo
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            {...register("name")}
                            className={cn("rounded-xl h-11 bg-zinc-50/50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 focus:ring-amber-500/20", errors.name ? "border-red-500" : "")}
                        />
                        {errors.name && <p className="text-xs text-red-500 font-medium ml-1">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            {...register("email")}
                            className={cn("rounded-xl h-11 bg-zinc-50/50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-800 focus:ring-amber-500/20", errors.email ? "border-red-500" : "")}
                        />
                        {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={saving} className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-90 text-white gap-2 rounded-full px-10 shadow-lg shadow-orange-500/20 h-12 transition-all duration-300 font-bold cursor-pointer">
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {saving ? "Updating Profile..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Password Tab ─────────────────────────────────────────────────────────────

function PasswordTab() {
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
            toast.success("Password changed successfully!");
            reset();
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Failed to update password.";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-zinc-900 dark:text-zinc-100">Change Password</CardTitle>
                <CardDescription>Choose a strong password to secure your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="current_password">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                type={showCurrent ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("current_password")}
                                className={cn("pr-10 rounded-xl", errors.current_password ? "border-red-500" : "")}
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.current_password && <p className="text-xs text-red-500">{errors.current_password.message}</p>}
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showNew ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                                className={cn("pr-10 rounded-xl", errors.password ? "border-red-500" : "")}
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password_confirmation")}
                                className={cn("pr-10 rounded-xl", errors.password_confirmation ? "border-red-500" : "")}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password_confirmation && <p className="text-xs text-red-500">{errors.password_confirmation.message}</p>}
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={saving} className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-90 text-white gap-2 rounded-full px-8 shadow-lg shadow-orange-500/20 py-6 transition-all duration-300 cursor-pointer">
                            <Save size={18} />
                            <span className="font-bold">{saving ? "Updating..." : "Update Password"}</span>
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────

const themes = [
    { id: "light", label: "Light", icon: Sun, description: "Clean and bright interface" },
    { id: "dark", label: "Dark", description: "Easy on the eyes at night", icon: Moon },
    { id: "system", label: "System", description: "Follows your OS preference", icon: Monitor },
];

function AppearanceTab() {
    const { theme, setTheme } = useTheme();

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-zinc-900 dark:text-zinc-100">Appearance</CardTitle>
                <CardDescription>Choose how the dashboard looks and feels.</CardDescription>
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
