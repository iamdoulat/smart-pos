"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ContactService } from "@/lib/contact-service";
import { useAuthStore } from "@/lib/store";
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
            toast.error("Please select a file first");
            return;
        }

        setImporting(true);
        try {
            await ContactService.import(currentCompany.id, isCustomer ? 'customer' : 'vendor', file);
            toast.success(`${isCustomer ? 'Customers' : 'Suppliers'} imported successfully!`);
            router.push(`/contacts/${isCustomer ? 'customers' : 'suppliers'}`);
        } catch (error) {
            toast.error("Failed to import contacts. Please check file format.");
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
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transform -rotate-3 transition-transform hover:rotate-0",
                    isCustomer
                        ? "bg-gradient-to-br from-amber-500 via-indigo-600 to-pink-500 shadow-orange-500/20"
                        : "bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-indigo-500/20"
                )}>
                    <ArrowLeftCircle size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent tracking-tighter uppercase italic py-1 leading-none">
                        Import {isCustomer ? "Customers" : "Suppliers"}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight mt-1">
                        Bulk upload your directory using a CSV file.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Instructions */}
                <Card className="md:col-span-1 border-0 shadow-xl bg-white dark:bg-zinc-900/50 rounded-[2rem] overflow-hidden">
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-800" />
                    <CardHeader>
                        <CardTitle className="text-lg font-black flex items-center gap-2 tracking-tight">
                            <Info size={18} className="text-indigo-500" />
                            Instructions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <p>1. Download the CSV template to ensure correct format.</p>
                        <p>2. Fill in the columns: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">name</code> (Required), <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">email</code>, <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">phone</code>, etc.</p>
                        <p>3. Upload the file and confirm the import.</p>
                        <Button
                            variant="outline"
                            onClick={downloadTemplate}
                            className="w-full mt-4 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold"
                        >
                            <FileText className="mr-2 h-4 w-4" /> Template.csv
                        </Button>
                    </CardContent>
                </Card>

                {/* Upload Zone */}
                <Card className="md:col-span-2 border-0 shadow-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden">
                    <div className={cn(
                        "h-2",
                        isCustomer ? "bg-gradient-to-r from-amber-500 to-pink-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                    )} />
                    <CardContent className="p-10">
                        <div
                            className={cn(
                                "border-4 border-dashed rounded-[2rem] p-12 text-center transition-all group relative cursor-pointer",
                                file ? "border-green-500 bg-green-500/5" : "border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 hover:bg-indigo-500/5"
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
                                    {file ? file.name : "Choose CSV File"}
                                </h3>
                                <p className="text-sm text-zinc-500 font-bold max-w-xs mx-auto">
                                    {file ? `${(file.size / 1024).toFixed(2)} KB • Ready to import` : "Drag and drop your file here or click to browse files from your computer."}
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
                                Max size 5MB • CSV Only
                            </div>
                            <Button
                                disabled={!file || importing}
                                onClick={handleImport}
                                className={cn(
                                    "px-10 h-14 rounded-full font-black uppercase italic tracking-tighter text-lg shadow-xl transition-all",
                                    isCustomer
                                        ? "bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 text-white shadow-orange-500/20"
                                        : "bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white shadow-indigo-500/20"
                                )}
                            >
                                {importing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <CheckCircle2 className="mr-2 h-6 w-6" />}
                                Start Import
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
