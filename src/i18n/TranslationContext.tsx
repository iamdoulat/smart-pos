"use client";

import React, { createContext, useContext, useMemo, useEffect } from "react";
import { useAuthStore } from "@/lib/store";

import en from "./translations/en.json";
import bn from "./translations/bn.json";
import ar from "./translations/ar.json";

// All available translation dictionaries
const translations: Record<string, Record<string, string>> = {
    EN: en,
    BN: bn,
    AR: ar,
};

// RTL languages
const RTL_LANGUAGES = ["AR"];

interface TranslationContextType {
    t: (key: string, fallbackOrParams?: string | Record<string, any>) => string;
    locale: string;
    isRTL: boolean;
    dir: "ltr" | "rtl";
}

const TranslationContext = createContext<TranslationContextType>({
    t: (key: string) => key,
    locale: "EN",
    isRTL: false,
    dir: "ltr",
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
    const { currentCompany } = useAuthStore();

    const locale = (currentCompany?.language || "EN").toUpperCase();
    const isRTL = RTL_LANGUAGES.includes(locale);
    const dir = isRTL ? "rtl" : "ltr";

    // Set HTML dir attribute for RTL support
    useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = locale.toLowerCase();

        // Add/remove RTL class for custom styling
        if (isRTL) {
            document.documentElement.classList.add("rtl");
        } else {
            document.documentElement.classList.remove("rtl");
        }
    }, [dir, locale, isRTL]);

    const t = useMemo(() => {
        const dict = translations[locale] || translations["EN"];
        const fallbackDict = translations["EN"];

        return (key: string, fallbackOrParams?: string | Record<string, any>): string => {
            let str = dict[key] || fallbackDict[key] || (typeof fallbackOrParams === 'string' ? fallbackOrParams : key);
            if (typeof fallbackOrParams === 'object') {
                Object.entries(fallbackOrParams).forEach(([k, v]) => {
                    str = str.replace(`{${k}}`, String(v));
                });
            }
            return str;
        };
    }, [locale]);

    const value: TranslationContextType = useMemo(() => ({ t, locale, isRTL, dir: dir as "ltr" | "rtl" }), [t, locale, isRTL, dir]);

    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    );
}

/**
 * Hook to access translations.
 * 
 * Usage:
 *   const { t } = useTranslation();
 *   <span>{t("sidebar.dashboard")}</span>
 */
export function useTranslation() {
    return useContext(TranslationContext);
}
