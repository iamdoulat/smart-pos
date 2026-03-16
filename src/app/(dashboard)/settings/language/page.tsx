"use client";

import React, { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Loader2,
    Globe,
    Languages
} from "lucide-react";
import { Language, LanguageService } from "@/lib/language-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LanguagePage() {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        is_active: true
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLanguages();
    }, []);

    const fetchLanguages = async () => {
        try {
            setLoading(true);
            const data = await LanguageService.getLanguages();
            console.log("Fetched languages:", data);
            setLanguages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch languages:", error);
            toast.error("Failed to load languages");
            setLanguages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setFormData({
            name: "",
            code: "",
            is_active: true
        });
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (lang: Language) => {
        setSelectedLanguage(lang);
        setFormData({
            name: lang.name,
            code: lang.code,
            is_active: lang.is_active
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await LanguageService.createLanguage(formData);
            toast.success("Language added successfully");
            setIsAddModalOpen(false);
            fetchLanguages();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to add language";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLanguage) return;
        try {
            setSubmitting(true);
            await LanguageService.updateLanguage(selectedLanguage.id, formData);
            toast.success("Language updated successfully");
            setIsEditModalOpen(false);
            fetchLanguages();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to update language";
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this language?")) return;
        try {
            await LanguageService.deleteLanguage(id);
            toast.success("Language deleted successfully");
            fetchLanguages();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to delete language";
            toast.error(message);
        }
    };

    const filteredLanguages = (Array.isArray(languages) ? languages : []).filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 p-6 md:p-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                        <Languages size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight">Language Settings</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage supported languages and translations.</p>
                    </div>
                </div>
                <Button
                    onClick={handleOpenAddModal}
                    className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 py-6 h-auto"
                >
                    <Plus className="h-5 w-5" />
                    <span className="font-bold">Add Language</span>
                </Button>
            </div>

            {/* List/Table Section */}
            <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <Input
                            placeholder="Search by name or code..."
                            className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 border-transparent focus:border-indigo-500 rounded-2xl transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center text-zinc-500 gap-4">
                        <Loader2 className="animate-spin text-indigo-500" size={40} />
                        <p className="font-medium animate-pulse">Fetching languages from database...</p>
                    </div>
                ) : filteredLanguages.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                                    <TableHead className="w-[100px] pl-8">#</TableHead>
                                    <TableHead>Language</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead className="text-right pr-8">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLanguages.map((lang, idx) => (
                                    <TableRow key={lang.id} className="group hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors border-zinc-100 dark:border-zinc-800">
                                        <TableCell className="pl-8 font-mono text-zinc-400">{(idx + 1).toString().padStart(2, '0')}</TableCell>
                                        <TableCell className="font-bold text-zinc-900 dark:text-zinc-100 italic">{lang.name}</TableCell>
                                        <TableCell>
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-black tracking-wider text-zinc-600 dark:text-zinc-400 uppercase">
                                                {lang.code}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="flex items-center justify-end gap-2 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEditModal(lang)}
                                                    className="h-8 w-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 font-bold"
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(lang.id)}
                                                    className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 text-rose-500"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="p-20 flex flex-col items-center justify-center text-zinc-400 gap-4">
                        <div className="h-16 w-16 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-300">
                            <Globe size={32} />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-lg text-zinc-900 dark:text-zinc-100">No languages found</p>
                            <p className="text-sm">Start by adding your first system language.</p>
                        </div>
                        <Button
                            onClick={handleOpenAddModal}
                            variant="outline"
                            className="mt-2 rounded-xl font-bold bg-white dark:bg-zinc-900"
                        >
                            Add New Language
                        </Button>
                    </div>
                )}
            </div>

            {/* Add Language Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Plus size={20} />
                            Add New Language
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            Register a new language for system-wide localization.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleCreate}>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Language Name</label>
                                <Input
                                    placeholder="e.g. English"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">ISO Code</label>
                                <Input
                                    placeholder="e.g. EN or BN"
                                    required
                                    maxLength={10}
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-black uppercase"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-full px-6 font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                {submitting ? "Adding..." : "Add Language"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 p-6 text-white">
                        <DialogTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Pencil size={20} />
                            Edit Language
                        </DialogTitle>
                        <DialogDescription className="text-white/80 text-sm mt-1">
                            Update details for <span className="font-bold underline italic">{selectedLanguage?.name}</span>.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleUpdate}>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">Language Name</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">ISO Code</label>
                                <Input
                                    required
                                    maxLength={10}
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-all font-black uppercase"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsEditModalOpen(false)}
                                className="rounded-full px-6 font-bold"
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-gradient-to-r from-amber-500 to-indigo-600 text-white rounded-full px-8 gap-2 shadow-lg shadow-orange-500/20 font-bold h-11"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} />}
                                {submitting ? "Updating..." : "Update Language"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
