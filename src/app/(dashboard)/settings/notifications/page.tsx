"use client";
import { useTranslation } from "@/i18n/TranslationContext";
import { Bell } from "lucide-react";
export default function NotificationsPage() {
    const { t } = useTranslation();
    return (
        <div className="w-full p-4 md:p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">{t("notifications.title")}</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("notifications.subtitle")}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 mx-auto mb-4 border border-zinc-100 dark:border-zinc-700">
                    <Bell size={32} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t("notifications.coming_soon")}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-2">
                    We're working on advanced notification preferences. Stay tuned!
                </p>
            </div>
        </div>
    );
}
