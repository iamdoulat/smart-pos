"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthService } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/lib/store";
import { getAssetUrl } from "@/lib/utils";
import logoImg from "@/assets/logo.png";
import bgImg from "@/assets/auth-bg.png";

const resetPasswordSchema = z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    password_confirmation: z.string().min(8, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { currentCompany, refreshCompany } = useAuthStore();

    useEffect(() => {
        if (!currentCompany) {
            refreshCompany();
        }
    }, [currentCompany, refreshCompany]);

    const companyLogo = currentCompany?.logo_url ? getAssetUrl(currentCompany.logo_url) : null;

    const token = searchParams.get("token") || "";
    const email = searchParams.get("email") || "";

    useEffect(() => {
        if (!token || !email) {
            toast.error("Invalid password reset link.");
        }
    }, [token, email]);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            password_confirmation: "",
        },
    });

    async function onSubmit(data: ResetPasswordFormValues) {
        setLoading(true);
        try {
            await AuthService.resetPassword({
                token,
                email,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });
            setSuccess(true);
            toast.success("Password reset successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password. The link may be expired.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Image
                    src={bgImg}
                    alt="Background"
                    fill
                    className="object-cover opacity-30 dark:opacity-40 blur-[1px]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/20 to-transparent dark:from-zinc-950 dark:via-zinc-950/20 dark:to-transparent" />
            </div>

            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md z-10 relative">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-20 h-20 mb-4 drop-shadow-2xl">
                        <Image
                            src={companyLogo || logoImg}
                            alt={currentCompany?.name || "Hurpori Logo"}
                            fill
                            className="object-contain"
                            priority
                            unoptimized={!!companyLogo}
                        />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                        Hurpori POS Software
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center max-w-[280px]">
                        Tailored Technology for the Modern Boutique
                    </p>
                </div>

                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl transition-all duration-300">
                    {success ? (
                        <>
                            <CardHeader className="space-y-1 pb-4 pt-8 px-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Password Reset Successful
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Your password has been reset successfully. You can now sign in with your new password.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-4">
                                <Button
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all py-6 text-base font-semibold border-0"
                                    onClick={() => router.push("/login")}
                                >
                                    Sign In to Dashboard
                                </Button>
                            </CardFooter>
                        </>
                    ) : (
                        <>
                            <CardHeader className="space-y-1 pb-6 pt-8 px-8">
                                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Reset your password
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Enter your new password below.
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <CardContent className="space-y-5 px-8">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">New Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 transition-all focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 px-4 py-6 text-base tracking-widest shadow-sm"
                                            {...form.register("password")}
                                        />
                                        {form.formState.errors.password && (
                                            <p className="text-sm font-medium text-red-500 dark:text-red-400 mt-1">
                                                {form.formState.errors.password.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-zinc-700 dark:text-zinc-300">Confirm New Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="••••••••"
                                            className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 transition-all focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 px-4 py-6 text-base tracking-widest shadow-sm"
                                            {...form.register("password_confirmation")}
                                        />
                                        {form.formState.errors.password_confirmation && (
                                            <p className="text-sm font-medium text-red-500 dark:text-red-400 mt-1">
                                                {form.formState.errors.password_confirmation.message}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all py-6 text-base font-semibold border-0"
                                        disabled={loading || !token || !email}
                                    >
                                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                        Reset Password
                                    </Button>
                                    <div className="text-sm text-center text-zinc-500 dark:text-zinc-400 pt-2">
                                        <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors inline-flex items-center gap-1">
                                            <ArrowLeft className="w-4 h-4" />
                                            Back to Sign In
                                        </Link>
                                    </div>
                                </CardFooter>
                            </form>
                        </>
                    )}
                </Card>
            </div>

            <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400 z-10">
                &copy; {new Date().getFullYear()} Hurpori POS Software. All rights reserved.
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
