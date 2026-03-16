"use client";
import { Bell } from "lucide-react";
export default function NotificationsPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Bell size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Notifications</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage notification preferences.</p>
                </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center text-zinc-400">Coming soon…</div>
        </div>
    );
}
