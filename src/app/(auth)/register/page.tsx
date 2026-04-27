"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthService } from "@/lib/auth-service";
import { useAuthStore } from "@/lib/store";
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
import Link from "next/link";
import { Loader2, CheckCircle2, Mail } from "lucide-react";
import { cn, getAssetUrl } from "@/lib/utils";
import logoImg from "@/assets/logo.png";
import bgImg from "@/assets/auth-bg.png";
import Image from "next/image";

const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;
export default function RegisterPage() {
    const router = useRouter();
    const { user, setUser, currentCompany, refreshCompany } = useAuthStore();
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

    useEffect(() => {
        // Fetch company info for the logo
        if (!currentCompany) {
            refreshCompany();
        }
    }, [currentCompany, refreshCompany]);

    const companyLogo = currentCompany?.logo_url ? getAssetUrl(currentCompany.logo_url) : null;

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (user || token) {
            window.location.href = "/dashboard";
        }
    }, [user, router]);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
        },
    });

    async function onSubmit(data: RegisterFormValues) {
        setLoading(true);
        try {
            await AuthService.register(data);
            setRegisteredEmail(data.email);
            setRegistrationSuccess(true);
            toast.success("Account created! Check your email for verification.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    // Success state - show verification message
    if (registrationSuccess) {
        return (
            <>
                <div className="w-full max-w-md my-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative w-24 h-24 mb-4 drop-shadow-2xl group transition-transform hover:scale-105 duration-300">
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner" />
                            <Image
                                src={companyLogo || logoImg}
                                alt={currentCompany?.name || "Hurpori Logo"}
                                fill
                                className="object-contain p-2 relative z-20"
                                priority
                                unoptimized={!!companyLogo}
                            />
                        </div>
                        <div className="bg-black/30 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-xl text-center">
                            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md">
                                Hurpori POS Software
                            </h1>
                            <p className="text-zinc-100 mt-1 font-medium text-sm max-w-[280px]">
                                Tailored Technology for the Modern Boutique
                            </p>
                        </div>
                    </div>

                    <Card className="border-0 shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl transition-all duration-300">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/20 animate-in zoom-in duration-500">
                                <Mail className="h-10 w-10 text-white" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Check Your Email
                                </h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                    We&apos;ve sent a verification link to{" "}
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                        {registeredEmail}
                                    </span>
                                    . Please click the link to verify your email address.
                                </p>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left">
                                <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                                    📋 <strong>What happens next?</strong>
                                </p>
                                <ol className="text-sm text-amber-700 dark:text-amber-400 mt-2 space-y-1 list-decimal list-inside">
                                    <li>Verify your email by clicking the link</li>
                                    <li>Wait for admin to activate your account</li>
                                    <li>You&apos;ll be able to login once activated</li>
                                </ol>
                            </div>

                            <div className="pt-2 space-y-3">
                                <Button
                                    onClick={() => router.push("/login")}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all py-6 text-base font-semibold border-0"
                                >
                                    Go to Login
                                </Button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await AuthService.resendVerification(registeredEmail);
                                            toast.success("Verification email resent!");
                                        } catch {
                                            toast.error("Failed to resend. Please try again later.");
                                        }
                                    }}
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium transition-colors"
                                >
                                    Didn&apos;t receive the email? Resend verification
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400 z-10">
                    &copy; {new Date().getFullYear()} Hurpori POS Software. All rights reserved.
                </div>
            </>
        );
    }

    return (
        <>
            <div className="w-full max-w-md my-8">
            <div className="flex flex-col items-center mb-8">
                    <div className="relative w-24 h-24 mb-4 drop-shadow-2xl group transition-transform hover:scale-105 duration-300">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner" />
                        <Image
                            src={companyLogo || logoImg}
                            alt={currentCompany?.name || "Hurpori Logo"}
                            fill
                            className="object-contain p-2 relative z-20"
                            priority
                            unoptimized={!!companyLogo}
                        />
                    </div>
                    <div className="bg-black/30 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-xl text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md">
                            Hurpori POS Software
                        </h1>
                        <p className="text-zinc-100 mt-1 font-medium text-sm max-w-[280px]">
                            Tailored Technology for the Modern Boutique
                        </p>
                    </div>
                </div>

                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl transition-all duration-300">
                    <CardHeader className="space-y-1 pb-6 pt-8 px-8">
                        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Create an account
                        </CardTitle>
                        <CardDescription className="text-zinc-500 dark:text-zinc-400">
                            Enter your details below to create your account
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-5 px-8">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                    className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 transition-all focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 px-4 py-6 text-base shadow-sm"
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <p className="text-sm font-medium text-red-500 dark:text-red-400 mt-1">{form.formState.errors.name.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="admin@admin.com"
                                    className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 transition-all focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 px-4 py-6 text-base shadow-sm"
                                    {...form.register("email")}
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm font-medium text-red-500 dark:text-red-400 mt-1">{form.formState.errors.email.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 transition-all focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 px-4 py-6 text-base tracking-widest shadow-sm"
                                    {...form.register("password")}
                                />
                                {form.formState.errors.password && (
                                    <p className="text-sm font-medium text-red-500 dark:text-red-400 mt-1">{form.formState.errors.password.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-zinc-700 dark:text-zinc-300">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 transition-all focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 px-4 py-6 text-base tracking-widest shadow-sm"
                                    {...form.register("password_confirmation")}
                                />
                                {form.formState.errors.password_confirmation && (
                                    <p className="text-sm font-medium text-red-500 dark:text-red-400 mt-1">{form.formState.errors.password_confirmation.message}</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all py-6 text-base font-semibold border-0"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Create Account
                            </Button>
                            <div className="text-sm text-center text-zinc-500 dark:text-zinc-400 pt-2">
                                Already have an account?{" "}
                                <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400 z-10">
                &copy; {new Date().getFullYear()} Hurpori POS Software. All rights reserved.
            </div>
        </>
    );
}
