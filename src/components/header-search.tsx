"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Command,
    ShoppingCart,
    Package,
    Users,
    Banknote,
    BookOpen,
    Ship,
    FileText,
    Settings,
    LayoutDashboard,
    ArrowRight,
    SearchX
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchItem {
    title: string;
    href: string;
    icon: any;
    category: string;
}

const searchItems: SearchItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
    { title: "POS Terminal", href: "/pos", icon: ShoppingCart, category: "Sales" },
    { title: "Sales History", href: "/pos/history", icon: ShoppingCart, category: "Sales" },
    { title: "All Products", href: "/inventory", icon: Package, category: "Inventory" },
    { title: "Add Product", href: "/inventory/add", icon: Package, category: "Inventory" },
    { title: "Customers", href: "/contacts/customers", icon: Users, category: "Contacts" },
    { title: "Suppliers", href: "/contacts/suppliers", icon: Users, category: "Contacts" },
    { title: "Bank & Payments", href: "/bank", icon: Banknote, category: "Finance" },
    { title: "Chart of Accounts", href: "/accounts", icon: BookOpen, category: "Finance" },
    { title: "Reports", href: "/reports", icon: FileText, category: "System" },
    { title: "General Settings", href: "/settings/general", icon: Settings, category: "System" },
];

export function HeaderSearch({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
    const [query, setQuery] = React.useState("");
    const router = useRouter();

    const filteredItems = query === ""
        ? []
        : searchItems.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(true);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [setOpen]);

    const handleSelect = (href: string) => {
        setOpen(false);
        setQuery("");
        router.push(href);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-[600px] p-0 overflow-hidden border-zinc-200/50 dark:border-zinc-800/50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-2xl">
                <DialogHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <DialogTitle className="sr-only">Search</DialogTitle>
                    <div className="flex items-center gap-3 px-1">
                        <Search className="h-5 w-5 text-zinc-400" />
                        <Input
                            placeholder="Search everything... (Ctrl+K)"
                            className="border-none bg-transparent focus-visible:ring-0 text-lg px-0 h-auto placeholder:text-zinc-400"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                            <Command size={10} /> K
                        </div>
                    </div>
                </DialogHeader>

                <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                    {query === "" ? (
                        <div className="p-4 py-8 text-center space-y-3">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto text-indigo-500">
                                <Search size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Quick Navigation</h3>
                                <p className="text-xs text-zinc-500">Search for sales, products, customers, or settings.</p>
                            </div>
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <div className="space-y-4 pb-2">
                            {Array.from(new Set(filteredItems.map(i => i.category))).map(category => (
                                <div key={category} className="space-y-1">
                                    <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        {category}
                                    </div>
                                    {filteredItems.filter(i => i.category === category).map((item) => (
                                        <button
                                            key={item.href}
                                            onClick={() => handleSelect(item.href)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                                                    <item.icon size={18} />
                                                </div>
                                                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                                                    {item.title}
                                                </span>
                                            </div>
                                            <ArrowRight size={14} className="text-zinc-300 group-hover:text-indigo-500 transition-all transform translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center space-y-3">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400">
                                <SearchX size={24} />
                            </div>
                            <p className="text-sm font-medium text-zinc-500">No results found for "{query}"</p>
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">Enter</kbd> to select</span>
                        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">Esc</kbd> to close</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
