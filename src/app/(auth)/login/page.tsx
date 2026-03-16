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
import { Loader2, Fingerprint } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (user || token) {
            router.replace("/dashboard");
        }
    }, [user, router]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: LoginFormValues) {
        setLoading(true);
        try {
            const response = await AuthService.login(data);
            setUser(response.user);
            toast.success("Logged in successfully!");
            router.replace("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
                        <Fingerprint className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                        Smart POS Software
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center">
                        Modern SME Accounting System
                    </p>
                </div>

                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl transition-all duration-300">
                    <CardHeader className="space-y-1 pb-6 pt-8 px-8">
                        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Welcome back
                        </CardTitle>
                        <CardDescription className="text-zinc-500 dark:text-zinc-400">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-5 px-8">
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
                                    <p className="text-sm font-medium text-red-500 dark:text-red-400 mt-1">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
                                    <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
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
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all py-6 text-base font-semibold border-0"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Sign In to Dashboard
                            </Button>
                            <div className="text-sm text-center text-zinc-500 dark:text-zinc-400 pt-2">
                                Don't have an account?{" "}
                                <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                                    Create one now
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400 z-10">
                &copy; {new Date().getFullYear()} Smart POS Software. All rights reserved.
            </div>
        </div>
    );
}
