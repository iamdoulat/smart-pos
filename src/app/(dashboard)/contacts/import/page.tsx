"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ContactService } from "@/lib/contact-service";
import { useAuthStore } from "@/lib/store";
import { useTranslation } from "@/i18n/TranslationContext";
import { Button } from "@/components/ui/button";
import {
    ArrowLeftCircle,
    Upload,
    FileText,
    CheckCircle2,
    Loader2,
    X,
    Info,
    AlertCircle,
    Users,
    Truck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function ImportContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { currentCompany } = useAuthStore();
    const type = (searchParams.get('type') as 'customer' | 'supplier') || 'customer';
    const isCustomer = type === 'customer';

    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!currentCompany || !file) {
            toast.error(t('contacts.select_file_first'));
            return;
        }

        setImporting(true);
        try {
            await ContactService.import(currentCompany.id, isCustomer ? 'customer' : 'vendor', file);
            toast.success(isCustomer ? t('contacts.customers_imported') : t('contacts.suppliers_imported'));
            router.push(`/contacts/${isCustomer ? 'customers' : 'suppliers'}`);
        } catch (error) {
            toast.error(t('contacts.import_failed'));
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const headers = "name,email,phone,address,tax_id,opening_balance";
        const blob = new Blob([headers], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_import_template.csv`;
        a.click();
    };

    return (
        <div className="w-full p-4 md:p-6 space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 transform -rotate-3 transition-transform hover:rotate-0">
                    <ArrowLeftCircle size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tighter uppercase py-1 leading-tight pt-[5px]">
                        {isCustomer ? t('contacts.import_customers') : t('contacts.import_suppliers')}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight mt-1">
                        {t('contacts.import_subtitle')}
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Instructions */}
                <Card className="md:col-span-1 border-0 shadow-xl bg-white dark:bg-zinc-900/50 rounded-xl overflow-hidden">
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-800" />
                    <CardHeader>
                        <CardTitle className="text-lg font-black flex items-center gap-2 tracking-tight">
                            <Info size={18} className="text-indigo-500" />
                            {t('contacts.instructions')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <p>{t('contacts.instruction_1')}</p>
                        <p>{t('contacts.instruction_2')}</p>
                        <p>{t('contacts.instruction_3')}</p>
                        <Button
                            variant="outline"
                            onClick={downloadTemplate}
                            className="w-full mt-4 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold"
                        >
                            <FileText className="mr-2 h-4 w-4" /> {t('contacts.template_csv')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Upload Zone */}
                <Card className="md:col-span-2 border-0 shadow-2xl bg-white dark:bg-zinc-900 rounded-xl overflow-hidden">
                    <div className={cn(
                        "h-2",
                        isCustomer ? "bg-gradient-to-r from-amber-500 to-pink-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                    )} />
                    <CardContent className="p-10">
                        <div
                            className={cn(
                                "border-4 border-dashed rounded-xl p-12 text-center transition-all group relative cursor-pointer",
                                file ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                            )}
                        >
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="relative z-0">
                                <div className={cn(
                                    "h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110",
                                    file ? "bg-green-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-indigo-500"
                                )}>
                                    {file ? <CheckCircle2 size={40} /> : <Upload size={40} />}
                                </div>
                                <h3 className="text-xl font-black tracking-tight mb-2">
                                    {file ? file.name : t('contacts.choose_csv')}
                                </h3>
                                <p className="text-sm text-zinc-500 font-bold max-w-xs mx-auto">
                                    {file ? `${(file.size / 1024).toFixed(2)} KB • ${t('contacts.ready_to_import')}` : t('contacts.drag_and_drop')}
                                </p>
                            </div>
                            {file && (
                                <button
                                    onClick={(e) => { e.preventDefault(); setFile(null); }}
                                    className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors z-20"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="mt-10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                <AlertCircle size={14} />
                                {t('contacts.max_size')}
                            </div>
                            <Button
                                disabled={!file || importing}
                                onClick={handleImport}
                                className="px-10 h-14 rounded-full bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 text-white shadow-lg shadow-indigo-500/25 font-black uppercase tracking-tighter text-lg transition-all hover:scale-[1.02] active:scale-95 border-0"
                            >
                                {importing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <CheckCircle2 className="mr-2 h-6 w-6" />}
                                {t('contacts.start_import')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function ImportPage() {
    return (
        <Suspense fallback={<div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
            <ImportContent />
        </Suspense>
    );
}
