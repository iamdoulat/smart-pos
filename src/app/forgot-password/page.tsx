"use client";

import { useState } from "react";
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
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import Image from "next/image";

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(data: ForgotPasswordFormValues) {
        setLoading(true);
        try {
            await AuthService.forgotPassword(data);
            setEmailSent(true);
            toast.success("Password reset link sent to your email!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Image
                    src="/images/auth-bg.png"
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
                            src="/images/logo.png"
                            alt="Hurpori Logo"
                            fill
                            className="object-contain"
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
                    {emailSent ? (
                        <>
                            <CardHeader className="space-y-1 pb-4 pt-8 px-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <MailCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Check your email
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-4">
                                <Button
                                    variant="outline"
                                    className="w-full py-6 text-base"
                                    onClick={() => setEmailSent(false)}
                                >
                                    Send another link
                                </Button>
                                <div className="text-sm text-center text-zinc-500 dark:text-zinc-400 pt-2">
                                    <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors inline-flex items-center gap-1">
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Sign In
                                    </Link>
                                </div>
                            </CardFooter>
                        </>
                    ) : (
                        <>
                            <CardHeader className="space-y-1 pb-6 pt-8 px-8">
                                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Forgot password?
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Enter your email address and we&apos;ll send you a link to reset your password.
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
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4 px-8 pb-8 pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all py-6 text-base font-semibold border-0"
                                        disabled={loading}
                                    >
                                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                        Send Reset Link
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
