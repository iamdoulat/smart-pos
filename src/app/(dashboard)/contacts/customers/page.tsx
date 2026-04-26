"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ContactService, Contact } from "@/lib/contact-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Users,
    Search,
    Edit2,
    Trash2,
    Mail,
    Phone,
    MapPin,
    Loader2,
    PlusSquare,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
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

function CustomersContent() {
    const router = useRouter();
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
            const data = await ContactService.getAll(currentCompany.id, 'customer');
            setContacts(data);
        } catch (error) {
            toast.error("Failed to load customers");
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
            toast.success("Customer deleted successfully");
            loadContacts();
        } catch (error) {
            toast.error("Failed to delete customer");
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
        <div className="w-full space-y-4 animate-in fade-in duration-700 pb-20 px-8 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-amber-500 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 transform -rotate-3 transition-transform hover:rotate-0">
                        <Users size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tighter uppercase py-1 leading-none mb-1">Customers</h2>
                        <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            Manage your customer database and relations.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Search */}
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <Input
                            placeholder="Search customers by name, email or phone..."
                            className="pl-12 h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => router.push('/contacts/customers/form')}
                        className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 text-white rounded-full px-8 h-12 shadow-lg shadow-orange-500/25 font-black uppercase tracking-tighter transition-all hover:scale-[1.02] active:scale-95 border-0"
                    >
                        <PlusSquare className="mr-2 h-5 w-5" /> Add Customer
                    </Button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                                <tr>
                                    <th className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">CID</th>
                                    <th className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Customer Name</th>
                                    <th className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Mobile</th>
                                    <th className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-4 text-center font-black text-xs text-black dark:text-white uppercase tracking-widest">Opening Balance</th>
                                    <th className="px-6 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Address</th>
                                    <th className="px-6 py-4 text-right font-black text-xs text-black dark:text-white uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {paginatedContacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full font-mono">
                                                CID-{contact.id.toString().padStart(3, '0')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{contact.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {contact.mobile || contact.phone ? (
                                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full w-fit">
                                                    <Phone size={12} strokeWidth={3} />
                                                    <span>{contact.mobile || contact.phone}</span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400 text-xs font-medium">No mobile</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {contact.email ? (
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full w-fit">
                                                    <Mail size={12} />
                                                    <span>{contact.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400 text-xs font-medium">No email</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full font-mono">
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
                                                <span className="text-zinc-400 text-xs font-medium">No address</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/contacts/customers/form?id=${contact.id}`)}
                                                    className="h-8 w-8 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500"
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
                                                    <AlertDialogContent className="rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden">
                                                        <div className="bg-red-500 p-8 text-white">
                                                            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                                                                <Trash2 size={32} />
                                                            </div>
                                                            <AlertDialogTitle className="text-2xl font-black tracking-tighter uppercase leading-none">Delete Customer?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-red-50 mt-2 font-medium">
                                                                This action will permanently delete <span className="font-bold underline">{contact.name}</span> and all associated transaction history.
                                                            </AlertDialogDescription>
                                                        </div>
                                                        <AlertDialogFooter className="p-6 bg-white dark:bg-zinc-950 gap-3">
                                                            <AlertDialogCancel className="rounded-full border-zinc-200 dark:border-zinc-800 font-bold px-8 h-12">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(contact.id)} className="bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-10 h-12 shadow-lg shadow-red-500/20 border-0">Confirm Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredContacts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 mb-6">
                                                    <Users size={40} />
                                                </div>
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">No customers found</h3>
                                                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mt-2 font-medium leading-relaxed">
                                                    {searchTerm ? "No customers match your search criteria." : "Your customer directory is currently empty. Click the button above to start building your database."}
                                                </p>
                                                {!searchTerm && (
                                                    <Button
                                                        onClick={() => router.push('/contacts/customers/form')}
                                                        className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-12 px-8 font-bold shadow-lg shadow-indigo-500/20"
                                                    >
                                                        <PlusSquare className="mr-2 h-5 w-5" /> Start Now
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
                                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length} Records
                            </span>

                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-xl h-10 w-10 p-0 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-all"
                                >
                                    <ChevronLeft size={18} />
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
                                                    "h-10 w-10 rounded-xl text-xs font-black transition-all flex items-center justify-center",
                                                    currentPage === pageNum
                                                        ? "bg-gradient-to-br from-amber-500 via-indigo-600 to-pink-500 text-white shadow-lg shadow-indigo-500/30"
                                                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700"
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
                                    className="rounded-xl h-10 w-10 p-0 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 font-bold text-zinc-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-all"
                                >
                                    <ChevronRight size={18} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function CustomersPage() {
    return (
        <Suspense fallback={<div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
            <CustomersContent />
        </Suspense>
    );
}
