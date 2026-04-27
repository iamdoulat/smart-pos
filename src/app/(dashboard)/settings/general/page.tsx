"use client";

import { useState, useEffect, useRef } from "react";
import {
    Settings,
    Building2,
    MapPin,
    User,
    Mail,
    Phone,
    Hash,
    Globe,
    Image as ImageIcon,
    Upload,
    Save,
    Loader2,
    Smartphone,
    Layout,
    Type,
    FileText,
    Monitor,
    SmartphoneNfc,
    Camera,
    ChevronDown,
    DollarSign,
    Languages,
    QrCode
} from "lucide-react";
import { useTranslation } from "@/i18n/TranslationContext";
import { CompanyService, Company } from "@/lib/company-service";
import { CurrencyService, Currency } from "@/lib/currency-service";
import { LanguageService, Language } from "@/lib/language-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn, getAssetUrl } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:8000";

export default function GeneralSettingsPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [company, setCompany] = useState<any>(null);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const { refreshCompany } = useAuthStore();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const [companies, currencyData, languageData] = await Promise.all([
                    CompanyService.getAll(),
                    CurrencyService.getCurrencies(),
                    LanguageService.getLanguages()
                ]);

                if (companies.length > 0) {
                    setCompany(companies[0]);
                }
                setCurrencies(currencyData);
                setLanguages(languageData);
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Failed to load settings data");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleFileChange = (field: string, file: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!company) return;

        setSaving(true);
        const formData = new FormData(e.currentTarget);
        // Important for Laravel to handle multipart PUT/PATCH
        formData.append('_method', 'PUT');

        try {
            const updated = await CompanyService.update(company.id, formData);
            setCompany(updated);
            await refreshCompany();
            toast.success(t("settings.success_profile_update"));
            setPreviews({});
        } catch (error: any) {
            console.error("Update error:", error);
            const msg = error.response?.data?.message;
            const errors = error.response?.data?.errors;

            if (errors) {
                const firstError = Object.values(errors)[0] as string[];
                toast.error(firstError[0] || t("common.validation_failed"));
            } else {
                toast.error(msg || t("settings.error_profile_update"));
            }
        } finally {
            setSaving(false);
        }
    };

    const renderFileInput = (id: string, label: string, currentUrl: string | undefined, icon: any) => {
        const Icon = icon;
        const preview = previews[id] || (currentUrl ? getAssetUrl(currentUrl) : null);

        return (
            <div className="space-y-4">
                <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Icon size={16} />
                    {t(label)}
                </Label>
                <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 relative group">
                        {preview ? (
                            <img src={preview} alt={label} className="h-full w-full object-contain p-2" />
                        ) : (
                            <ImageIcon className="text-zinc-300" size={32} />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="text-white" size={24} />
                        </div>
                        <input
                            type="file"
                            id={id}
                            name={id === 'logo_path' ? 'logo' : id === 'favicon_path' ? 'favicon' : id === 'qr_code_path' ? 'qr_code' : id}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleFileChange(id, e.target.files?.[0] || null)}
                            accept="image/*"
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-xs font-semibold text-zinc-500">{t("settings.click_to_upload")}</p>
                        <p className="text-[10px] text-zinc-400">{t("settings.upload_help")}</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7 rounded-lg mt-2 font-bold"
                            onClick={() => document.getElementById(id)?.click()}
                        >
                            {t("settings.select_image")}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-amber-500" size={32} />
            </div>
        );
    }

    return (
        <div className="w-full p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20">
            <form ref={formRef} onSubmit={handleSubmit}>
                <Tabs defaultValue="general" className="space-y-10">
                    {/* Header Row with Tabs on Right */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-[1.5rem] bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 relative group transition-all duration-500 hover:scale-105">
                                <Settings size={24} strokeWidth={2.5} className="relative z-10" />
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-400 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter uppercase leading-none">
                                    {t("settings.general_settings")}
                                </h1>
                                <p className="text-[9px] md:text-[11px] text-zinc-500 dark:text-zinc-400 font-black tracking-[0.2em] uppercase opacity-70">
                                    {t("settings.manage_preferences")}
                                </p>
                            </div>
                        </div>

                        <TabsList className="bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-full h-14 shadow-inner">
                            <TabsTrigger value="general" className="rounded-full px-10 h-full data-[state=active]:bg-gradient-to-r from-rose-500 to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-orange-500/40 font-black transition-all duration-500 uppercase tracking-widest text-[10px]">
                                {t("settings.general_details")}
                            </TabsTrigger>
                            <TabsTrigger value="pwa" className="rounded-full px-10 h-full data-[state=active]:bg-gradient-to-r from-rose-500 to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-orange-500/40 font-black transition-all duration-500 uppercase tracking-widest text-[10px]">
                                {t("settings.pwa_settings")}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Company Information */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Building2 size={20} className="text-amber-500" />
                                            {t("settings.company_info")}
                                        </h3>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.company_name")}</Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="name" name="name" defaultValue={company?.name} placeholder="Global Tech Solutions" className="pl-10 rounded-xl" required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="tax_id" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.tax_id")}</Label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="tax_id" name="tax_id" defaultValue={company?.tax_id} placeholder="TX-998-001" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="legal_identity" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.location_legal")}</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 text-zinc-400" size={16} />
                                                    <textarea
                                                        id="legal_identity"
                                                        name="legal_identity"
                                                        defaultValue={company?.legal_identity}
                                                        placeholder={t("settings.location_legal")}
                                                        className="w-full pl-10 pt-2 h-24 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="pos_receipt_address" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.pos_receipt_address")}</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 text-zinc-400" size={16} />
                                                    <textarea
                                                        id="pos_receipt_address"
                                                        name="pos_receipt_address"
                                                        defaultValue={company?.pos_receipt_address}
                                                        placeholder={t("settings.pos_receipt_address")}
                                                        className="w-full pl-10 pt-2 h-20 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pos_email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.pos_email")}</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="pos_email" name="pos_email" type="email" defaultValue={company?.pos_email} placeholder="pos@company.com" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pos_website" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.pos_website")}</Label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="pos_website" name="pos_website" defaultValue={company?.pos_website} placeholder="www.company.com" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pos_mobile" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.pos_mobile")}</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="pos_mobile" name="pos_mobile" defaultValue={company?.pos_mobile} placeholder="+1 234 567 890" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <User size={20} className="text-indigo-500" />
                                            {t("settings.contact_details")}
                                        </h3>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact_person" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.contact_person")}</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="contact_person" name="contact_person" defaultValue={company?.contact_person} placeholder="John Doe" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.email_address")}</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="email" name="email" type="email" defaultValue={company?.email} placeholder="contact@company.com" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.phone_number")}</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="phone" name="phone" defaultValue={company?.phone} placeholder="+1 234 567 890" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="timezone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.company_timezone")}</Label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10" size={16} />
                                                    <select
                                                        id="timezone"
                                                        name="timezone"
                                                        defaultValue={company?.timezone || "UTC"}
                                                        className="w-full pl-10 pr-4 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none"
                                                        required
                                                    >
                                                        {Intl.supportedValuesOf('timeZone').map((tz) => (
                                                            <option key={tz} value={tz}>{tz}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="currency" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.system_currency")}</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none" size={16} />
                                                    <select
                                                        id="currency"
                                                        name="currency"
                                                        value={company?.currency || ""}
                                                        onChange={(e) => setCompany((prev: any) => ({ ...prev, currency: e.target.value }))}
                                                        className="w-full pl-10 pr-10 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none font-bold"
                                                        required
                                                    >
                                                        <option value="" disabled>{t("common.select_currency")}</option>
                                                        {currencies.length > 0 ? (
                                                            currencies.map((curr) => (
                                                                <option key={curr.id} value={curr.code}>
                                                                    {curr.code} - {curr.name} ({curr.symbol})
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option value="USD">USD - US Dollar ($)</option>
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="language" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.system_language")}</Label>
                                                <div className="relative">
                                                    <Languages className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none" size={16} />
                                                    <select
                                                        id="language"
                                                        name="language"
                                                        value={company?.language || ""}
                                                        onChange={(e) => setCompany((prev: any) => ({ ...prev, language: e.target.value }))}
                                                        className="w-full pl-10 pr-10 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none font-bold"
                                                        required
                                                    >
                                                        <option value="" disabled>{t("common.select_language")}</option>
                                                        {languages.length > 0 ? (
                                                            languages.map((lang) => (
                                                                <option key={lang.id} value={lang.code}>
                                                                    {lang.name} ({lang.code})
                                                                </option>
                                                            ))
                                                        ) : (
                                                            <option value="EN">English (EN)</option>
                                                        )}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logo & Branding */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden sticky top-6">
                                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <ImageIcon size={20} className="text-pink-500" />
                                            {t("settings.branding")}
                                        </h3>
                                    </div>
                                    <div className="p-8 space-y-10">
                                        {renderFileInput("logo_path", "settings.company_logo", company?.logo_url, Building2)}
                                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
                                            {renderFileInput("favicon_path", "settings.app_favicon", company?.favicon_url, Globe)}
                                        </div>
                                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
                                            {renderFileInput("qr_code_path", "settings.google_qr", company?.qr_code_url, QrCode)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* General Tab Save Button */}
                        <div className="flex justify-end pt-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        disabled={saving}
                                        className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full h-12 px-10 gap-2 shadow-lg shadow-orange-500/20 font-bold transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        {saving ? t("common.saving") : t("settings.save_settings")}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl font-bold">{t("settings.save_general_title")}</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
                                            {t("settings.save_general_desc")}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-2">
                                        <AlertDialogCancel className="rounded-xl border-zinc-200 dark:border-zinc-800 font-bold">{t("common.cancel")}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => formRef.current?.requestSubmit()}
                                            className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-xl font-bold px-6 shadow-md shadow-orange-500/10"
                                        >
                                            {t("common.confirm_save")}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </TabsContent>

                    <TabsContent value="pwa" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{t("settings.pwa_settings")}</h3>
                                        <p className="text-xs text-zinc-500">{t("settings.manage_preferences")}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-10">
                                {/* Text Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label htmlFor="app_name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.app_name")}</Label>
                                        <div className="relative">
                                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                            <Input id="app_name" name="app_name" defaultValue={company?.app_name} placeholder="Smart School Pro" className="pl-10 rounded-xl h-12" />
                                        </div>
                                        <p className="text-[10px] text-zinc-400 italic">{t("settings.pwa_desc_help")}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="app_short_name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.app_short_name")}</Label>
                                        <div className="relative">
                                            <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                            <Input id="app_short_name" name="app_short_name" defaultValue={company?.app_short_name} placeholder="SmartSchool" className="pl-10 rounded-xl h-12" />
                                        </div>
                                        <p className="text-[10px] text-zinc-400 italic">{t("settings.pwa_short_desc_help")}</p>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="app_description" className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t("settings.app_description")}</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 text-zinc-400" size={16} />
                                            <textarea
                                                id="app_description"
                                                name="app_description"
                                                defaultValue={company?.app_description}
                                                placeholder={t("settings.pwa_summary_help")}
                                                className="w-full pl-10 pt-3 h-24 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Uploads */}
                                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                        <Monitor size={16} className="text-indigo-500" />
                                        {t("settings.pwa_assets")}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                                        {renderFileInput("pwa_icon_144", "settings.icon_144", company?.pwa_icon_144_url, Smartphone)}
                                        {renderFileInput("pwa_icon_192", "settings.icon_192", company?.pwa_icon_192_url, Smartphone)}
                                        {renderFileInput("pwa_icon_512", "settings.icon_512", company?.pwa_icon_512_url, Smartphone)}
                                        {renderFileInput("pwa_maskable_icon", "settings.maskable_icon", company?.pwa_maskable_icon_url, SmartphoneNfc)}
                                        {renderFileInput("pwa_screenshot", "settings.screenshot", company?.pwa_screenshot_url, Camera)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PWA Tab Save Button */}
                        <div className="flex justify-end pt-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        disabled={saving}
                                        className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full h-12 px-10 gap-2 shadow-lg shadow-orange-500/20 font-bold transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        {saving ? t("common.updating") : t("settings.save_settings")}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl font-bold">{t("settings.update_pwa_title")}</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
                                            {t("settings.update_pwa_desc")}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-2">
                                        <AlertDialogCancel className="rounded-xl border-zinc-200 dark:border-zinc-800 font-bold">{t("common.cancel")}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => formRef.current?.requestSubmit()}
                                            className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-xl font-bold px-6 shadow-md shadow-orange-500/10"
                                        >
                                            {t("common.confirm_save")}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </div>
    );
}
