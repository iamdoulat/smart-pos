"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Receipt,
    ShoppingCart,
    Package,
    Users,
    Banknote,
    BarChart3,
    BookOpen,
    Ship,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Menu,
    Search,
    Bell,
    MessageCircle,
    MessageSquare,
    Mail,
    CreditCard,
    Globe,
    DollarSign,
    UserCog,
    PlusSquare,
    List,
    ArrowLeftCircle,
    Maximize,
    Minimize,
    Check,
    CalendarDays,
    ShieldCheck
} from "lucide-react";
import { cn, getAssetUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthService } from "@/lib/auth-service";
import { useRouter } from "next/navigation";
import { CompanySelector } from "@/components/company-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { LanguageService, Language } from "@/lib/language-service";
import { CurrencyService, Currency } from "@/lib/currency-service";
import { CompanyService } from "@/lib/company-service";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeaderSearch } from "@/components/header-search";
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
import { TranslationProvider, useTranslation } from "@/i18n/TranslationContext";

const sidebarNavItems = [
    {
        titleKey: "sidebar.dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        titleKey: "sidebar.pos",
        href: "/pos",
        icon: ShoppingCart,
        children: [
            { titleKey: "sidebar.pos_terminal", href: "/pos", icon: PlusSquare },
            { titleKey: "sidebar.sales_history", href: "/pos/history", icon: List },
        ],
    },
    {
        titleKey: "sidebar.inventory",
        href: "/inventory",
        icon: Package,
        children: [
            { titleKey: "sidebar.all_products", href: "/inventory", icon: Package },
            { titleKey: "sidebar.add_product", href: "/inventory/add", icon: PlusSquare },
            { titleKey: "sidebar.categories_list", href: "/inventory/categories", icon: List },
            { titleKey: "sidebar.brands_list", href: "/inventory/brands", icon: List },
            { titleKey: "sidebar.variants_list", href: "/inventory/variants", icon: List },
            { titleKey: "sidebar.warehouse_list", href: "/inventory/warehouses", icon: List },
        ],
    },
    {
        titleKey: "sidebar.sales_purchase",
        href: "/sales",
        icon: ShoppingCart,
        children: [
            { titleKey: "sidebar.all_sales", href: "/sales", icon: List },
            { titleKey: "sidebar.create_invoice", href: "/sales/new", icon: PlusSquare },
        ],
    },
    {
        titleKey: "sidebar.bank_payments",
        href: "/bank",
        icon: Banknote,
    },
    {
        titleKey: "sidebar.contacts",
        href: "/contacts",
        icon: Users,
        children: [
            { titleKey: "sidebar.add_customer", href: "/contacts/customers/form", icon: PlusSquare },
            { titleKey: "sidebar.customers_list", href: "/contacts/customers", icon: List },
            { titleKey: "sidebar.add_supplier", href: "/contacts/suppliers/form", icon: PlusSquare },
            { titleKey: "sidebar.suppliers_list", href: "/contacts/suppliers", icon: List },
            { titleKey: "sidebar.import_customers", href: "/contacts/import?type=customer", icon: ArrowLeftCircle },
            { titleKey: "sidebar.import_suppliers", href: "/contacts/import?type=supplier", icon: ArrowLeftCircle },
        ],
    },
    {
        titleKey: "sidebar.chart_of_accounts",
        href: "/accounts",
        icon: BookOpen,
    },
    {
        titleKey: "sidebar.import_shipping",
        href: "/imports",
        icon: Ship,
    },
    {
        titleKey: "sidebar.reports",
        href: "/reports",
        icon: FileText,
    },
    {
        titleKey: "sidebar.system_settings",
        href: "/settings/general",
        icon: Settings,
        children: [
            { titleKey: "sidebar.general_settings", href: "/settings/general", icon: Settings },
            { titleKey: "sidebar.notifications", href: "/settings/notifications", icon: Bell },
            { titleKey: "sidebar.whatsapp_setting", href: "/settings/whatsapp", icon: MessageCircle },
            { titleKey: "sidebar.sms_setting", href: "/settings/sms", icon: MessageSquare },
            { titleKey: "sidebar.email_setting", href: "/settings/email", icon: Mail },
            { titleKey: "sidebar.payment_methods", href: "/settings/payments", icon: CreditCard },
            { titleKey: "sidebar.tax_management", href: "/settings/taxes", icon: BarChart3 },
            { titleKey: "sidebar.language", href: "/settings/language", icon: Globe },
            { titleKey: "sidebar.currencies", href: "/settings/currencies", icon: DollarSign },
            { titleKey: "sidebar.users", href: "/settings/users", icon: UserCog },
            { titleKey: "sidebar.roles", href: "/settings/roles", icon: ShieldCheck },
        ],
    },
];

function DashboardLayoutInner({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ "/settings/general": true });
    const { user, setUser, currentCompany, setCurrentCompany, refreshCompany, sessionYear, setSessionYear } = useAuthStore();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [languages, setLanguages] = useState<Language[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:8000";

    // Sync fullscreen state
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err: any) => {
                toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const toggleMenu = (href: string) => {
        setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }));
    };

    // Auto-collapse sidebar when opening POS terminal
    useEffect(() => {
        if (pathname === '/pos') {
            setIsCollapsed(true);
        }
        // Close mobile menu on route change
        setIsMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                router.push("/login");
                return;
            }

            if (!user) {
                try {
                    const userData = await AuthService.me();
                    setUser(userData);
                } catch (error) {
                    localStorage.removeItem("auth_token");
                    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    router.push("/login");
                }
            }
        };

        checkAuth();
        refreshCompany();
    }, [user, setUser, router, refreshCompany]);

    // Load Languages and Currencies
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [langData, currData] = await Promise.all([
                    LanguageService.getLanguages(),
                    CurrencyService.getCurrencies()
                ]);
                setLanguages(langData);
                setCurrencies(currData);
            } catch (error) {
                console.error("Failed to load header settings data:", error);
            }
        };
        loadInitialData();
    }, []);

    const handleLanguageChange = async (langCode: string) => {
        if (!currentCompany) return;
        try {
            const formData = new FormData();
            formData.append('language', langCode);
            await CompanyService.update(currentCompany.id, formData);
            await refreshCompany();
            toast.success(`Language updated to ${langCode}`);
        } catch (error) {
            toast.error("Failed to update language");
        }
    };

    const handleCurrencyChange = async (currencyCode: string) => {
        if (!currentCompany) return;
        try {
            const formData = new FormData();
            formData.append('currency', currencyCode);
            await CompanyService.update(currentCompany.id, formData);
            await refreshCompany();
            toast.success(`Currency updated to ${currencyCode}`);
        } catch (error) {
            toast.error("Failed to update currency");
        }
    };

    // Dynamic Title & Favicon
    useEffect(() => {
        if (currentCompany) {
            document.title = `${currentCompany.name} | Dashboard`;

            if (currentCompany.favicon_url) {
                let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = getAssetUrl(currentCompany.favicon_url);
            }
        }
    }, [currentCompany, API_BASE_URL]);

    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? 'hidden' : 'hidden'; // Keep hidden but handle mobile scroll separately
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileOpen]);

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            setUser(null);
            toast.success("Successfully logged out");
        } catch (error) {
            console.error("Logout error:", error);
            setUser(null);
            toast.error("Failed to logout cleanly, but session cleared locally");
        } finally {
            router.push("/login");
        }
    };

    const SidebarContent = ({ collapsed = false, onChildClick = () => {} }) => (
        <>
            <div className="h-16 px-4 flex items-center gap-3 sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {currentCompany?.logo_url && (
                        <div className="p-[2px] rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-pink-500 shadow-lg shadow-orange-500/20 shrink-0">
                            <div className="h-10 w-10 rounded-[10px] overflow-hidden bg-white dark:bg-zinc-900 border border-white/10 flex items-center justify-center">
                                <img
                                    src={getAssetUrl(currentCompany.logo_url)}
                                    alt="Logo"
                                    className="h-full w-full object-contain p-0.5"
                                />
                            </div>
                        </div>
                    )}
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-lg font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight truncate leading-none">
                                {currentCompany?.name || "Hurpori POS"}
                            </span>
                        </div>
                    )}
                </div>
                {!onChildClick && ( // Only show toggle on desktop
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 px-4">
                <nav className="space-y-1 py-4">
                    {sidebarNavItems.map((item: any) => {
                        const isActive = pathname === item.href || item.children?.some((c: any) => pathname === c.href);
                        const isOpen = openMenus[item.href];

                        if (item.children) {
                            return (
                                <div key={item.href} className="mb-1">
                                    <button
                                        onClick={() => !collapsed && toggleMenu(item.href)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                                            isActive ? "bg-white/20 backdrop-blur-sm" : "bg-zinc-100 dark:bg-zinc-800"
                                        )}>
                                            <item.icon size={18} className={isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"} />
                                        </div>
                                        {!collapsed && (
                                            <>
                                                <span className="font-semibold flex-1 text-left text-sm tracking-tight">{t(item.titleKey)}</span>
                                                <ChevronDown size={16} className={cn("transition-transform duration-300 opacity-70", isOpen ? "rotate-180" : "")} />
                                            </>
                                        )}
                                    </button>

                                    {!collapsed && isOpen && (
                                        <div className="mt-1 ml-7 pl-4 border-l border-orange-200 dark:border-orange-500/30 space-y-1 py-1">
                                            {item.children.map((child: any) => {
                                                const isChildActive = pathname === child.href;
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        onClick={onChildClick}
                                                        className={cn(
                                                            "flex items-center justify-between px-4 py-2 rounded-full transition-all duration-200 text-[13px] group",
                                                            isChildActive
                                                                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/10 font-bold"
                                                                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
                                                        )}
                                                    >
                                                        <span>{t(child.titleKey)}</span>
                                                        {isChildActive && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-glow" />}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onChildClick}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-200 group mb-1",
                                    pathname === item.href
                                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                                    pathname === item.href ? "bg-white/20 backdrop-blur-sm" : "bg-zinc-100 dark:bg-zinc-800"
                                )}>
                                    <item.icon size={18} className={pathname === item.href ? "text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"} />
                                </div>
                                {!collapsed && <span className="font-semibold text-sm tracking-tight">{t(item.titleKey)}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-400/10"
                        >
                            <CalendarDays size={20} className="text-indigo-500" />
                            {!collapsed && (
                                <div className="flex flex-col items-start overflow-hidden text-left">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-tight">{t("sidebar.session_year")}</span>
                                    <span className="text-sm font-bold truncate">FY {sessionYear}</span>
                                </div>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end" className="w-48 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-1">
                        <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-400">{t("sidebar.select_session_year")}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                        {["2025", "2026", "2027", "2028", "2029", "2030"].map((year) => (
                            <DropdownMenuItem
                                key={year}
                                onClick={() => {
                                    setSessionYear(year);
                                    toast.success(`Switched to Financial Year ${year}`);
                                    window.location.reload();
                                }}
                                className="rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-zinc-700 dark:text-zinc-300 focus:bg-indigo-50 dark:focus:bg-indigo-900/20 flex items-center justify-between px-3 py-2"
                            >
                                <span className="text-sm font-bold">FY {year}</span>
                                {sessionYear === year && <Check size={14} className="text-indigo-500" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
            
            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-zinc-900 z-50 lg:hidden transform transition-transform duration-300 ease-in-out flex flex-col",
                    isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                )}
            >
                <SidebarContent onChildClick={() => setIsMobileOpen(false)} />
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex relative border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 flex-col h-full overflow-hidden",
                    isFullscreen ? "w-0 opacity-0 invisible border-none" : (isCollapsed ? "w-20" : "w-64")
                )}
            >
                <SidebarContent collapsed={isCollapsed} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full relative">
                <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-8 shrink-0 z-10">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-zinc-500 hover:text-zinc-900"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu size={20} />
                        </Button>
                        <h1 className="text-base lg:text-xl font-extrabold bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tight truncate max-w-[150px] lg:max-w-none">
                            {t(sidebarNavItems.find((item) => item.href === pathname)?.titleKey || "sidebar.dashboard")}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="h-8 w-8 hidden sm:flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <Search size={18} className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text" style={{ color: 'transparent', stroke: 'url(#searchGrad)' }} />
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="searchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#4f46e5" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </button>
                        <Button
                            onClick={() => router.push('/pos')}
                            className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 hover:scale-[1.02] active:scale-95 text-white shadow-lg shadow-orange-500/30 font-bold uppercase tracking-wider text-[10px] lg:text-xs h-8 px-3 lg:px-4 border-0 rounded-full transition-all"
                        >
                            <ShoppingCart className="mr-1.5 h-3 w-3 lg:h-3.5 lg:w-3.5" /> <span className="hidden xs:inline">POS</span>
                        </Button>
                        <HeaderSearch open={isSearchOpen} setOpen={setIsSearchOpen} />

                        <div className="hidden md:flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white relative" title="Language Settings">
                                        <Globe size={18} />
                                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] font-black text-white border-2 border-white dark:border-zinc-900 uppercase">
                                            {currentCompany?.language || 'EN'}
                                        </span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-1">
                                    <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-400">{t("header.select_language")}</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                                    <ScrollArea className="h-48">
                                        {languages.map((lang) => (
                                            <DropdownMenuItem
                                                key={lang.id}
                                                onClick={() => handleLanguageChange(lang.code)}
                                                className="rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-zinc-700 dark:text-zinc-300 focus:bg-indigo-50 dark:focus:bg-indigo-900/20 flex items-center justify-between px-3 py-2"
                                            >
                                                <span className="text-sm font-medium">{lang.name} ({lang.code})</span>
                                                {currentCompany?.language === lang.code && <Check size={14} className="text-indigo-500" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </ScrollArea>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white relative" title={`System Currency - ${currentCompany?.currency || "USD"}`}>
                                        <DollarSign size={18} />
                                        <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-0.5 rounded-full bg-emerald-500 flex items-center justify-center text-[7px] font-black text-white border-2 border-white dark:border-zinc-900 uppercase">
                                            {currentCompany?.currency || 'USD'}
                                        </span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-1">
                                    <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-400">{t("header.select_currency")}</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                                    <ScrollArea className="h-48">
                                        {currencies.map((curr) => (
                                            <DropdownMenuItem
                                                key={curr.id}
                                                onClick={() => handleCurrencyChange(curr.code)}
                                                className="rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-zinc-700 dark:text-zinc-300 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 flex items-center justify-between px-3 py-2"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold">{curr.code} - {curr.name}</span>
                                                    <span className="text-[10px] text-zinc-400 uppercase font-black">Rate: {curr.exchange_rate}</span>
                                                </div>
                                                {currentCompany?.currency === curr.code && <Check size={14} className="text-emerald-500" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </ScrollArea>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <ThemeToggle />
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow ring-2 ring-transparent hover:ring-indigo-300 dark:hover:ring-indigo-700 transition-all focus:outline-none overflow-hidden">
                                    {user?.avatar_url ? (
                                        <img
                                            src={getAssetUrl(user.avatar_url)}
                                            alt="Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "JD"
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-1">
                                <DropdownMenuLabel className="px-3 py-2">
                                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{user?.name ?? "User"}</p>
                                    <p className="text-xs text-zinc-400 truncate">{user?.email ?? ""}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                                <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-zinc-700 dark:text-zinc-300 focus:bg-indigo-50 dark:focus:bg-indigo-900/20">
                                    <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2">
                                        <UserCog size={15} className="text-indigo-500" />
                                        <span className="text-sm font-medium">{t("header.my_profile")}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="rounded-lg cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 flex items-center gap-2.5 px-3 py-2"
                                >
                                    <LogOut size={15} />
                                    <span className="text-sm font-medium">{t("header.sign_out")}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto font-sans p-0">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <TranslationProvider>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </TranslationProvider>
    );
}
