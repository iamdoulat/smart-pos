"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContactService, Contact } from "@/lib/contact-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Truck,
    Search,
    Edit2,
    Trash2,
    Mail,
    Phone,
    MapPin,
    Loader2,
    PlusSquare,
    CheckCircle2,
    X,
    FolderKanban,
    ChevronLeft,
    ChevronRight,
    Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
import { useTranslation } from "@/i18n/TranslationContext";

function SuppliersContent() {
    const router = useRouter();
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const { currentCompany } = useAuthStore();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    /* Pagination */
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const loadContacts = async () => {
        if (!currentCompany) return;
        try {
            setLoading(true);
            const data = await ContactService.getAll(currentCompany.id, 'vendor');
            setContacts(data);
        } catch (error) {
            toast.error(t('contacts.failed_to_load_suppliers'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, [currentCompany]);

    const handleDelete = async (id: number) => {
        try {
            await ContactService.delete(id);
            toast.success(t('contacts.supplier_deleted_success'));
            loadContacts();
        } catch (error) {
            toast.error(t('contacts.failed_to_delete_supplier'));
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
    const paginatedContacts = filteredContacts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="w-full p-4 md:p-6 space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-[1.5rem] bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-orange-500/30 relative group transition-all duration-500 hover:scale-105">
                        <Truck size={24} strokeWidth={2.5} className="relative z-10" />
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-400 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter uppercase leading-tight pt-[5px]">
                            {t('contacts.suppliers_title')}
                        </h1>
                        <p className="text-[9px] md:text-[11px] text-zinc-500 dark:text-zinc-400 font-black tracking-[0.2em] uppercase opacity-70">
                            {t('contacts.suppliers_subtitle')}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Search */}
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <Input
                            placeholder={t('contacts.search_suppliers')}
                            className="pl-12 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => router.push('/contacts/suppliers/form')}
                        className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full px-10 h-12 shadow-xl shadow-orange-500/20 font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95 border-0"
                    >
                        <PlusSquare size={18} strokeWidth={3} className="mr-2" /> {t('contacts.add_supplier')}
                    </Button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-black dark:text-white uppercase font-black tracking-widest text-xs">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-xl">{t('contacts.table_supplier_name')}</th>
                                    <th className="px-6 py-4">{t('contacts.table_mobile')}</th>
                                    <th className="px-6 py-4">{t('contacts.table_email')}</th>
                                    <th className="px-6 py-4 text-center">{t('contacts.table_balance')}</th>
                                    <th className="px-6 py-4">{t('contacts.table_address')}</th>
                                    <th className="px-6 py-4 text-right rounded-tr-xl">{t('inventory.table_action') || "Actions"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {paginatedContacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{contact.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {contact.mobile || contact.phone ? (
                                                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full w-fit">
                                                    <Phone size={12} strokeWidth={3} />
                                                    <span>{contact.mobile || contact.phone}</span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400 text-xs">{t('contacts.no_mobile')}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {contact.email ? (
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full w-fit">
                                                    <Mail size={12} />
                                                    <span>{contact.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400 text-xs">{t('contacts.no_email')}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full font-mono">
                                                {currentCompany?.currency} {Number(contact.opening_balance || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {contact.address ? (
                                                <div className="flex items-start gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 max-w-[150px]">
                                                    <MapPin size={14} className="mt-0.5 text-zinc-400 shrink-0" />
                                                    <span className="truncate leading-relaxed" title={contact.address}>{contact.address}</span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400 text-xs">{t('contacts.no_address')}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/contacts/suppliers/form?id=${contact.id}`)}
                                                    className="h-8 w-8 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-500"
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-xl border-0 shadow-2xl p-0 overflow-hidden">
                                                        <div className="bg-red-500 p-8 text-white">
                                                            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                                                                <Trash2 size={32} />
                                                            </div>
                                                            <AlertDialogTitle className="text-2xl font-black tracking-tighter uppercase leading-none">
                                                                {t('contacts.delete_supplier_title')}
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription className="text-red-50 mt-2 font-medium">
                                                                {t('contacts.delete_supplier_desc', { name: contact.name })}
                                                            </AlertDialogDescription>
                                                        </div>
                                                        <AlertDialogFooter className="p-6 bg-white dark:bg-zinc-950 gap-3">
                                                            <AlertDialogCancel className="rounded-xl border-zinc-200 dark:border-zinc-800 font-bold px-8 h-12">
                                                                {t('common.cancel') || "Cancel"}
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(contact.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold px-10 h-12 shadow-lg shadow-red-500/20 border-0">
                                                                {t('transactions.confirm_delete') || "Confirm Delete"}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredContacts.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 mb-6">
                                                    <Truck size={40} />
                                                </div>
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                                    {t('contacts.no_suppliers_found')}
                                                </h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mt-2 font-medium leading-relaxed">
                                                    {searchTerm ? t('contacts.no_suppliers_desc') : t('contacts.no_suppliers_empty')}
                                                </p>
                                                {!searchTerm && (
                                                    <Button
                                                        onClick={() => router.push('/contacts/suppliers/form')}
                                                        className="mt-8 bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-purple-500/20"
                                                    >
                                                        <PlusSquare className="mr-2 h-5 w-5" /> {t('contacts.add_supplier')}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Pagination */}
                    {filteredContacts.length > 0 && (
                        <div className="px-8 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest order-2 sm:order-1">
                                {t('contacts.showing_records', {
                                    start: (currentPage - 1) * itemsPerPage + 1,
                                    end: Math.min(currentPage * itemsPerPage, filteredContacts.length),
                                    total: filteredContacts.length
                                })}
                            </span>

                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-xl h-9 w-9 p-0 border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
                                >
                                    <ChevronLeft size={16} />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) {
                                            pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={cn(
                                                    "h-9 w-9 rounded-xl text-sm font-black transition-all",
                                                    currentPage === pageNum
                                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                                                        : "text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-xl h-9 w-9 p-0 border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
                                >
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SuppliersPage() {
    return (
        <Suspense fallback={<div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>}>
            <SuppliersContent />
        </Suspense>
    );
}
