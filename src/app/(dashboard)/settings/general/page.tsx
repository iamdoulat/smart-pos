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
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:8000";

export default function GeneralSettingsPage() {
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
            toast.success("Settings updated successfully");
            setPreviews({});
        } catch (error: any) {
            console.error("Update error:", error);
            const msg = error.response?.data?.message;
            const errors = error.response?.data?.errors;

            if (errors) {
                const firstError = Object.values(errors)[0] as string[];
                toast.error(firstError[0] || "Validation failed");
            } else {
                toast.error(msg || "Failed to update settings");
            }
        } finally {
            setSaving(false);
        }
    };

    const renderFileInput = (id: string, label: string, currentPath: string | undefined, icon: any) => {
        const Icon = icon;
        const preview = previews[id] || (currentPath ? `${API_BASE_URL}/storage/${currentPath}` : null);

        return (
            <div className="space-y-4">
                <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Icon size={16} />
                    {label}
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
                        <p className="text-xs font-semibold text-zinc-500">Click to upload or drag and drop</p>
                        <p className="text-[10px] text-zinc-400">PNG, JPG or GIF (max. 2MB)</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7 rounded-lg mt-2 font-bold"
                            onClick={() => document.getElementById(id)?.click()}
                        >
                            Select Image
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
        <div className="w-full space-y-6 pb-20 px-8 py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">System Settings</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your company details and application preferences.</p>
                    </div>
                </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-full h-12 shadow-sm">
                        <TabsTrigger value="general" className="rounded-full px-8 data-[state=active]:bg-gradient-to-r from-rose-500 to-orange-500 data-[state=active]:text-white font-bold transition-all duration-300 uppercase tracking-tighter">
                            General Details
                        </TabsTrigger>
                        <TabsTrigger value="pwa" className="rounded-full px-8 data-[state=active]:bg-gradient-to-r from-rose-500 to-orange-500 data-[state=active]:text-white font-bold transition-all duration-300 uppercase tracking-tighter">
                            PWA Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Company Information */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            <Building2 size={20} className="text-amber-500" />
                                            Company Information
                                        </h3>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Company Name</Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="name" name="name" defaultValue={company?.name} placeholder="Global Tech Solutions" className="pl-10 rounded-xl" required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="tax_id" className="text-xs font-bold uppercase tracking-wider text-zinc-500">TAX ID No.</Label>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="tax_id" name="tax_id" defaultValue={company?.tax_id} placeholder="TX-998-001" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="legal_identity" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Location & Legal Identity</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 text-zinc-400" size={16} />
                                                    <textarea
                                                        id="legal_identity"
                                                        name="legal_identity"
                                                        defaultValue={company?.legal_identity}
                                                        placeholder="Headquarters address, Registration details..."
                                                        className="w-full pl-10 pt-2 h-24 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label htmlFor="pos_receipt_address" className="text-xs font-bold uppercase tracking-wider text-zinc-500">POS Receipt Address</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 text-zinc-400" size={16} />
                                                    <textarea
                                                        id="pos_receipt_address"
                                                        name="pos_receipt_address"
                                                        defaultValue={company?.pos_receipt_address}
                                                        placeholder="Address to show on POS receipts..."
                                                        className="w-full pl-10 pt-2 h-20 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-zinc-400 italic">This address will appear on POS receipts instead of the default company address.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pos_email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">POS Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="pos_email" name="pos_email" type="email" defaultValue={company?.pos_email} placeholder="pos@company.com" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pos_website" className="text-xs font-bold uppercase tracking-wider text-zinc-500">POS Web Site</Label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="pos_website" name="pos_website" defaultValue={company?.pos_website} placeholder="www.company.com" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pos_mobile" className="text-xs font-bold uppercase tracking-wider text-zinc-500">POS Mobile No.</Label>
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
                                            Contact Details
                                        </h3>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="contact_person" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Contact Person</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="contact_person" name="contact_person" defaultValue={company?.contact_person} placeholder="John Doe" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="email" name="email" type="email" defaultValue={company?.email} placeholder="contact@company.com" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                                    <Input id="phone" name="phone" defaultValue={company?.phone} placeholder="+1 234 567 890" className="pl-10 rounded-xl" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="timezone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Company Time Zone</Label>
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
                                                <Label htmlFor="currency" className="text-xs font-bold uppercase tracking-wider text-zinc-500">System Currency</Label>
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
                                                        <option value="" disabled>Select Currency</option>
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
                                                <Label htmlFor="language" className="text-xs font-bold uppercase tracking-wider text-zinc-500">System Language</Label>
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
                                                        <option value="" disabled>Select Language</option>
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
                                            Branding
                                        </h3>
                                    </div>
                                    <div className="p-8 space-y-10">
                                        {renderFileInput("logo_path", "Company Logo", company?.logo_path, Building2)}
                                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
                                            {renderFileInput("favicon_path", "Application Favicon", company?.favicon_path, Globe)}
                                        </div>
                                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
                                            {renderFileInput("qr_code_path", "Google Business QR Code", company?.qr_code_path, QrCode)}
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
                                        {saving ? "Updating..." : "Save General Settings"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl font-bold">Save General Settings?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
                                            This will update your company information, contact details, and branding across the entire system.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-2">
                                        <AlertDialogCancel className="rounded-xl border-zinc-200 dark:border-zinc-800 font-bold">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => formRef.current?.requestSubmit()}
                                            className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-xl font-bold px-6 shadow-md shadow-orange-500/10"
                                        >
                                            Confirm & Save
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
                                        <h3 className="text-lg font-bold">PWA Settings</h3>
                                        <p className="text-xs text-zinc-500">Configure how your application looks when installed.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-10">
                                {/* Text Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label htmlFor="app_name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">App Name</Label>
                                        <div className="relative">
                                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                            <Input id="app_name" name="app_name" defaultValue={company?.app_name} placeholder="Smart School Pro" className="pl-10 rounded-xl h-12" />
                                        </div>
                                        <p className="text-[10px] text-zinc-400 italic">Primary name used for the installed app.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="app_short_name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">App Short Name</Label>
                                        <div className="relative">
                                            <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                            <Input id="app_short_name" name="app_short_name" defaultValue={company?.app_short_name} placeholder="SmartSchool" className="pl-10 rounded-xl h-12" />
                                        </div>
                                        <p className="text-[10px] text-zinc-400 italic">Used when space is limited (e.g., home screen icon labels).</p>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="app_description" className="text-xs font-bold uppercase tracking-wider text-zinc-500">App Description</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 text-zinc-400" size={16} />
                                            <textarea
                                                id="app_description"
                                                name="app_description"
                                                defaultValue={company?.app_description}
                                                placeholder="Summary of your application's purpose..."
                                                className="w-full pl-10 pt-3 h-24 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Uploads */}
                                <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                        <Monitor size={16} className="text-indigo-500" />
                                        PWA Assets
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                                        {renderFileInput("pwa_icon_144", "Icon (144x144)", company?.pwa_icon_144, Smartphone)}
                                        {renderFileInput("pwa_icon_192", "Icon (192x192)", company?.pwa_icon_192, Smartphone)}
                                        {renderFileInput("pwa_icon_512", "Icon (512x512)", company?.pwa_icon_512, Smartphone)}
                                        {renderFileInput("pwa_maskable_icon", "Maskable Icon", company?.pwa_maskable_icon, SmartphoneNfc)}
                                        {renderFileInput("pwa_screenshot", "Screenshot", company?.pwa_screenshot, Camera)}
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
                                        {saving ? "Updating..." : "Save PWA Settings"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl font-bold">Update PWA Configuration?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
                                            These changes will affect how your application is installed on mobile devices and desktops.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="gap-2">
                                        <AlertDialogCancel className="rounded-xl border-zinc-200 dark:border-zinc-800 font-bold">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => formRef.current?.requestSubmit()}
                                            className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-xl font-bold px-6 shadow-md shadow-orange-500/10"
                                        >
                                            Confirm & Save
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
