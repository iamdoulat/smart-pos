"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { ProductService } from "@/lib/product-service";
import { ContactService } from "@/lib/contact-service";
import { SaleService } from "@/lib/sales-purchase-service";
import { CategoryService } from "@/lib/category-service";
import { BrandService } from "@/lib/brand-service";
import { WarehouseService } from "@/lib/warehouse-service";
import { AccountService } from "@/lib/accounting-import-service";
import { WhatsappService } from "@/lib/whatsapp-service";
import { EmailService } from "@/lib/email-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    QrCode,
    User,
    CreditCard,
    Banknote,
    Receipt,
    List,
    Layers,
    X,
    Check,
    Loader2,
    Printer,
    Coins,
    Mail,
    MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn, getAssetUrl } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// Quebec Tax Rates
const GST_RATE = 0.05;
const QST_RATE = 0.09975;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:8000";

export default function POSTerminalPage() {
    const router = useRouter();
    const { currentCompany, refreshCompany } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedBrand, setSelectedBrand] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(50);
    const [sendWhatsapp, setSendWhatsapp] = useState(true);
    const [whatsappConfig, setWhatsappConfig] = useState<any>(null);
    const [sendEmail, setSendEmail] = useState(true);
    const [emailConfig, setEmailConfig] = useState<any>(null);

    const [customerName, setCustomerName] = useState("Walk-in Customer");
    const [customerMobile, setCustomerMobile] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [discount, setDiscount] = useState<number | "">(0);
    const [cart, setCart] = useState<any[]>([]);
    const [walkInCustomer, setWalkInCustomer] = useState<any>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [paymentMode, setPaymentMode] = useState<string>("Cash");
    const [cashAccountId, setCashAccountId] = useState<number | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);
    const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
    const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [checkoutStatus, setCheckoutStatus] = useState<"Paid" | "Partial" | "Unpaid" | "Split">("Paid");
    const [checkoutPaidAmount, setCheckoutPaidAmount] = useState<number | "">(0);

    const [splitCash, setSplitCash] = useState<number | "">(0);
    const [splitCard, setSplitCard] = useState<number | "">(0);
    const [splitPaypal, setSplitPaypal] = useState<number | "">(0);
    const [splitInterac, setSplitInterac] = useState<number | "">(0);
    const [checkoutNote, setCheckoutNote] = useState("");
    const [isRounded, setIsRounded] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    // Load Initial Data
    useEffect(() => {
        if (currentCompany) {
            // 1. Fetch auxiliary data (categories, brands, contacts, etc.) immediately to paint the UI
            Promise.all([
                CategoryService.getAll(currentCompany.id),
                BrandService.getAll(currentCompany.id),
                ContactService.getAll(currentCompany.id),
                WarehouseService.getAll(currentCompany.id),
                AccountService.getAll(currentCompany.id)
            ]).then(([categoriesData, brandsData, contactsData, warehousesData, accountsData]) => {
                setCategories(categoriesData);
                setBrands(brandsData);
                setWarehouses(warehousesData);
                setAccounts(accountsData);

                const cashAcc = accountsData.find((a: any) => a.name.toUpperCase() === 'CASH');
                if (cashAcc) setCashAccountId(cashAcc.id);

                const list = contactsData.filter(c => c.type === 'customer');
                setCustomers(list);
                if (list.length > 0) {
                    const walkIn = list.find(c => c.name.toLowerCase().includes('walk-in')) || list[0];
                    setWalkInCustomer(walkIn);
                    setSelectedCustomer(walkIn);
                    setCustomerName(walkIn.name);
                    setCustomerMobile(walkIn.mobile || walkIn.phone || "");
                    setCustomerEmail(walkIn.email || "");
                }

                WhatsappService.getConfigurations().then(configs => {
                    const active = configs.find(c => c.is_active);
                    if (active) setWhatsappConfig(active);
                }).catch(() => { });

                EmailService.getConfigurations().then(configs => {
                    const active = configs.find(c => c.is_active);
                    if (active) setEmailConfig(active);
                }).catch(() => { });

            }).catch(() => {
                toast.error("Failed to load generic data");
            });

            // 2. Fetch products separately so the UI isn't blocked by a large inventory payload
            setProductsLoading(true);
            ProductService.getAll(currentCompany.id).then(productsData => {
                setProducts(productsData);
            }).catch(() => {
                toast.error("Failed to load products");
            }).finally(() => {
                setProductsLoading(false);
            });
        }
    }, [currentCompany]);

    // Refresh company data on mount to ensure tax_id is available
    useEffect(() => {
        refreshCompany();
    }, []);

    // Calculations
    const totals = useMemo(() => {
        const subtotal = cart.reduce((acc, item) => acc + ((item.cart_price || item.sales_price) * item.quantity), 0);
        const gst = subtotal * GST_RATE;
        const qst = subtotal * QST_RATE;
        const discountAmount = Number(discount) || 0;
        const total = (subtotal + gst + qst) - discountAmount;
        const roundedTotal = isRounded ? Math.round(total) : total;
        return { subtotal, gst, qst, discount: discountAmount, total, roundedTotal };
    }, [cart, discount, isRounded]);

    // Live Customer Search Logic
    useEffect(() => {
        const query = (customerName === "Walk-in Customer" ? "" : customerName) || customerMobile;
        if (query.length >= 3) {
            const results = customers.filter(c =>
                c.name.toLowerCase().includes(query.toLowerCase()) ||
                (c.mobile && c.mobile.includes(query)) ||
                (c.phone && c.phone.includes(query))
            );
            setCustomerSearchResults(results);
            setShowCustomerSuggestions(results.length > 0);
        } else {
            setCustomerSearchResults([]);
            setShowCustomerSuggestions(false);
        }
    }, [customerName, customerMobile, customers]);

    const selectCustomer = (customer: any) => {
        setSelectedCustomer(customer);
        setCustomerName(customer.name);
        setCustomerMobile(customer.mobile || customer.phone || "");
        setCustomerEmail(customer.email || "");
        setShowCustomerSuggestions(false);
    };

    // Keep checkoutPaidAmount in sync with totals.roundedTotal when status is Paid
    useEffect(() => {
        if (checkoutStatus === "Paid") {
            setCheckoutPaidAmount(Number(totals.roundedTotal.toFixed(2)));
        } else if (checkoutStatus === "Unpaid") {
            setCheckoutPaidAmount(0);
        } else if (checkoutStatus === "Split") {
            const sum = (Number(splitCash) || 0) + (Number(splitCard) || 0) + (Number(splitPaypal) || 0) + (Number(splitInterac) || 0);
            setCheckoutPaidAmount(Number(sum.toFixed(2)));
        }
    }, [checkoutStatus, totals.roundedTotal, splitCash, splitCard, splitPaypal, splitInterac]);

    // Cart Logic
    const addToCart = (product: any) => {
        if (product.stock_quantity <= 0) {
            toast.error("Product is out of stock!");
            return;
        }

        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1, cart_price: product.sales_price }]);
        }
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const updatePrice = (id: number, price: number) => {
        setCart(cart.map(item =>
            item.id === id ? { ...item, cart_price: price } : item
        ));
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.item_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCategory = selectedCategory === "all" || p.category_id?.toString() === selectedCategory;
            const matchBrand = selectedBrand === "all" || p.brand_id?.toString() === selectedBrand;
            return matchSearch && matchCategory && matchBrand;
        });
    }, [products, searchQuery, selectedCategory, selectedBrand]);

    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    // POS Checkout
    const handleCheckout = async () => {
        if (!currentCompany || cart.length === 0) return;

        setLoading(true);
        try {
            let customerId = selectedCustomer?.id || null;

            // Auto-persist customer info if it's not the default Walk-in Customer
            if (customerName && customerName !== "Walk-in Customer" && !customerName.toLowerCase().includes('walk-in')) {
                const customerData = {
                    company_id: currentCompany.id,
                    type: 'customer' as const,
                    name: customerName,
                    mobile: customerMobile,
                    email: customerEmail,
                };

                // Check if customer exists by mobile or name to prevent duplicates
                const existing = customers.find(c =>
                    (customerMobile && c.mobile === customerMobile) ||
                    (c.name.toLowerCase() === customerName.toLowerCase())
                );

                if (existing) {
                    const updated = await ContactService.update(existing.id, customerData);
                    customerId = updated.id;
                } else {
                    const created = await ContactService.create(customerData);
                    customerId = created.id;
                }

                // Refresh customer list for next sale
                const updatedContacts = await ContactService.getAll(currentCompany.id, 'customer');
                setCustomers(updatedContacts);
            }

            const paidAmountNum = Number(checkoutPaidAmount) || 0;

            const saleData: any = {
                company_id: currentCompany.id,
                customer_id: customerId,
                customer_name: customerName,
                customer_mobile: customerMobile,
                customer_email: customerEmail,
                warehouse_id: warehouses.find(w => w.name.toLowerCase().includes('main'))?.id || warehouses[0]?.id || currentCompany.id,
                sales_date: new Date().toISOString().split('T')[0],
                reference_no: 'POS',
                subtotal: totals.subtotal,
                tax_amount: totals.gst + totals.qst,
                grand_total: totals.roundedTotal,
                paid_amount: checkoutStatus === "Unpaid" ? 0 : (paidAmountNum > totals.roundedTotal ? totals.roundedTotal : paidAmountNum),
                discount_on_all: discount,
                discount_type: 'Fixed' as const,
                payment_type: paymentMode,
                account_id: cashAccountId || undefined,
                status: 'Final' as const,
                payment_status: checkoutStatus === "Split" ? "Partial" : checkoutStatus, // Backend determines actual status (Paid vs Partial) based on paid_amount vs grand_total anyway
                items: cart.map(item => {
                    const price = item.cart_price || item.sales_price;
                    return {
                        product_id: item.id,
                        quantity: item.quantity,
                        unit_price: price,
                        discount_amount: 0,
                        tax_amount: (price * item.quantity) * (GST_RATE + QST_RATE),
                        total_amount: (price * item.quantity) * (1 + GST_RATE + QST_RATE)
                    };
                })
            };

            if (checkoutStatus === "Split") {
                const splits = [];
                if (Number(splitCash) > 0) splits.push({ payment_type: 'Cash', amount: Number(splitCash) });
                if (Number(splitCard) > 0) splits.push({ payment_type: 'Card', amount: Number(splitCard) });
                if (Number(splitPaypal) > 0) splits.push({ payment_type: 'Paypal', amount: Number(splitPaypal) });
                if (Number(splitInterac) > 0) splits.push({ payment_type: 'Interac', amount: Number(splitInterac) });
                saleData.split_payments = splits;
                saleData.payment_type = 'Split';
            }

            const response = await SaleService.create(saleData);
            setLastSale(response);

            if (sendWhatsapp && whatsappConfig && customerMobile) {
                WhatsappService.sendInvoiceNotification(whatsappConfig.id, customerMobile, {
                    sales_code: response.sales_code || 'POS-N/A',
                    customer_name: customerName,
                    grand_total: totals.roundedTotal,
                    paid_amount: Number(checkoutPaidAmount),
                    sales_date: new Date().toISOString().split('T')[0],
                    company_name: currentCompany.name,
                }).catch(() => toast.warning("Invoice saved, but WhatsApp failed."));
            }

            // Send Email
            if (sendEmail && emailConfig && customerEmail) {
                EmailService.sendInvoiceEmail(emailConfig.id, customerEmail, {
                    sales_code: response.sales_code || 'POS-N/A',
                    customer_name: customerName,
                    grand_total: totals.roundedTotal,
                    paid_amount: Number(checkoutPaidAmount),
                    balance_due: totals.roundedTotal - Number(checkoutPaidAmount),
                    sales_date: new Date().toISOString().split('T')[0],
                    company_name: currentCompany.name,
                    items: cart.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        unit_price: item.cart_price || item.sales_price,
                        total_amount: (item.cart_price || item.sales_price) * item.quantity
                    }))
                }).catch(() => toast.warning("Invoice saved, but Email failed."));
            }

            toast.success("Sale completed successfully!");
            setCart([]);
            setIsConfirmOpen(false);
            setIsReceiptOpen(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Checkout failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!lastSale || !customerEmail) {
            toast.error("Complete sale and provide email first");
            return;
        }

        setLoading(true);
        try {
            await SaleService.sendEmail(lastSale.id);
            toast.success("Invoice sent to " + customerEmail);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send email");
        } finally {
            setLoading(false);
        }
    };

    const printReceipt = () => {
        if (!receiptRef.current) return;
        const content = receiptRef.current.innerHTML;
        const printWindow = window.open('', '', 'height=600,width=400');
        if (printWindow) {
            printWindow.document.write('<html><head><title>&nbsp;</title>');
            printWindow.document.write('<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:"Courier New", Courier, monospace;padding:0 15px 15px 15px;width:300px;margin:0 auto;color:#000;font-size:10px;line-height:1.2;}.text-right{text-align:right;}.text-center{text-align:center;}.bold{font-weight:bold;}.font-black{font-weight:900;}.uppercase{text-transform:uppercase;}.my-3{margin-top:8px;margin-bottom:8px;}.mb-1{margin-bottom:4px;}.mb-2{margin-bottom:8px;}.mb-3{margin-bottom:12px;}.mb-4{margin-bottom:16px;}.leading-none{line-height:1;}.divider{border-top:1px dashed #000;margin:8px 0;width:100%;}.flex{display:flex;}.flex-col{flex-direction:column;}.justify-between{justify-content:space-between;}.items-center{align-items:center;}.items-start{align-items:flex-start;}.justify-center{justify-content:center;}.w-1/2{width:50%;}.w-1/4{width:25%;}.h-10{height:40px;}.w-10{width:40px;}.opacity-40{opacity:0.4;}.opacity-60{opacity:0.6;}.opacity-80{opacity:0.8;}.text-xs{font-size:12px;}.text-sm{font-size:14px;}.tracking-tight{letter-spacing:-0.025em;}.tracking-widest{letter-spacing:0.1em;}.italic{font-style:italic;}.underline{text-decoration:underline;}.logo-img{max-height:40px;width:auto;display:block;margin:0 auto;}.logo-div {border: 1px solid #e0e7ff; background-color: #eef2ff; border-radius: 12px; display: flex; align-items: center; justify-content: center;} .logo-div svg { color: #4f46e5; }.payment-badge{display:inline-block;padding:4px 12px;border:1px solid #000;border-radius:4px;background:#fff;box-shadow:2px 2px 0px rgba(0,0,0,0.1);font-weight:900;text-transform:uppercase;margin:10px 0;}.qr-img{height:80px;width:80px;object-fit:contain;margin-top:4px;}.gap-2{gap:8px;}.space-y-1 > * + *{margin-top:4px;}.space-y-2 > * + *{margin-top:8px;}.mt-4{margin-top:16px;}.pt-4{padding-top:16px;}.border-t{border-top:1px solid #000;}.border-dotted{border-style:dotted;}.text-rose-500{color:#f43f5e;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(content);
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            };
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] gap-4 overflow-hidden p-4 bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/10">
            <style jsx global>{`
                .scrollbar-visible::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .scrollbar-visible::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-visible::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .scrollbar-visible::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
                .scrollbar-visible {
                    scrollbar-width: thin;
                    scrollbar-color: #e2e8f0 transparent;
                }
                
                .cart-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .cart-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .cart-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #818cf8, #c084fc);
                    border-radius: 10px;
                }
                .cart-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #6366f1, #a855f7);
                }
                .qr-img {
                    height: 60px;
                    width: 60px;
                    object-fit: contain;
                    margin-top: 4px;
                }
            `}</style>

            {/* Left Column: Product Selection & Payment */}
            <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden min-w-0">
                {/* Header Rows */}
                <div className="flex flex-col gap-4 shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group px-4 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-2 shadow-sm focus-within:border-indigo-400 dark:focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                    <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none focus:outline-none font-bold text-slate-700 dark:text-zinc-100 text-sm placeholder:text-slate-300 dark:placeholder:text-zinc-500 w-full"
                                placeholder="Search by name or mobile..."
                                value={customerName}
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    if (selectedCustomer && e.target.value !== selectedCustomer.name) {
                                        setSelectedCustomer(null);
                                    }
                                }}
                                onFocus={() => {
                                    if (customerSearchResults.length > 0) setShowCustomerSuggestions(true);
                                }}
                            />
                            <Layers size={14} className="opacity-20 text-slate-400 shrink-0" />

                            {/* Suggestions Dropdown */}
                            {showCustomerSuggestions && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-[100] max-h-60 overflow-y-auto cart-scrollbar">
                                    {customerSearchResults.slice(0, 10).map(customer => (
                                        <div
                                            key={customer.id}
                                            onClick={() => selectCustomer(customer)}
                                            className="flex flex-col gap-0.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors group/suggestion border border-transparent hover:border-slate-100 dark:hover:border-zinc-700"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 dark:text-zinc-200 group-hover/suggestion:text-indigo-600 dark:group-hover/suggestion:text-indigo-400 transition-colors uppercase italic text-xs tracking-tight">
                                                        {customer.name}
                                                    </span>
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">
                                                        CID-{customer.id.toString().padStart(3, '0')}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {customer.mobile || customer.phone || "No Mobile"}
                                                </span>
                                            </div>
                                            {customer.email && (
                                                <span className="text-[10px] text-slate-400 truncate mt-0.5">{customer.email}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Dropdown Backdrop to close on click away */}
                        {showCustomerSuggestions && (
                            <div
                                className="fixed inset-0 z-[90]"
                                onClick={() => setShowCustomerSuggestions(false)}
                            />
                        )}

                        <div className="relative group px-4 h-12 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden pr-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 w-16 shrink-0">Mobile</span>
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none focus:outline-none font-medium text-slate-700 dark:text-zinc-100 text-sm placeholder:text-slate-300 dark:placeholder:text-zinc-500 w-full"
                                placeholder="Enter mobile"
                                value={customerMobile}
                                onChange={(e) => setCustomerMobile(e.target.value)}
                            />
                            {whatsappConfig && (
                                <div className="flex items-center gap-2 pl-2 border-l border-slate-100 h-full shrink-0">
                                    <input
                                        type="checkbox"
                                        id="pos-whatsapp"
                                        checked={sendWhatsapp}
                                        onChange={(e) => setSendWhatsapp(e.target.checked)}
                                        disabled={!customerMobile}
                                        className="h-4 w-4 rounded border-green-500 cursor-pointer accent-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={customerMobile ? "Send WhatsApp Notification" : "Enter mobile number to enable WhatsApp"}
                                    />
                                    <label htmlFor="pos-whatsapp" className={cn("cursor-pointer", !customerMobile && "opacity-50 cursor-not-allowed")}>
                                        <MessageCircle size={16} className={customerMobile ? "text-green-500" : "text-slate-300"} />
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="relative group px-4 h-12 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden pr-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 w-16 shrink-0">Email ID</span>
                            <input
                                type="email"
                                className="flex-1 bg-transparent border-none focus:outline-none font-medium text-slate-700 dark:text-zinc-100 text-sm placeholder:text-slate-300 dark:placeholder:text-zinc-500 w-full"
                                placeholder="Enter email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                            />
                            {emailConfig && (
                                <div className="flex items-center gap-2 pl-2 border-l border-slate-100 h-full shrink-0">
                                    <input
                                        type="checkbox"
                                        id="pos-email"
                                        checked={sendEmail}
                                        onChange={(e) => setSendEmail(e.target.checked)}
                                        disabled={!customerEmail}
                                        className="h-4 w-4 rounded border-indigo-500 cursor-pointer accent-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={customerEmail ? "Send Email Notification" : "Enter email address to enable Email"}
                                    />
                                    <label htmlFor="pos-email" className={cn("cursor-pointer", !customerEmail && "opacity-50 cursor-not-allowed")}>
                                        <Mail size={16} className={customerEmail ? "text-indigo-500" : "text-slate-300"} />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-row gap-4 shrink-0 items-center">
                        <div className="relative group flex-1">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" size={22} />
                             <Input
                                placeholder="Scan barcode or search products..."
                                className="h-13 pl-14 pr-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500/50 font-medium text-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-400 transition-all text-slate-900 dark:text-zinc-100"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                <span className="h-6 w-px bg-slate-200" />
                                <QrCode className="text-zinc-400 cursor-pointer hover:text-indigo-600 transition-colors" size={22} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[180px] h-13 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500/50 font-medium transition-all text-slate-900 dark:text-zinc-100">
                                    <div className="flex items-center gap-2">
                                        <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
                                        <SelectValue placeholder="Categories" />
                                    </div>
                                </SelectTrigger>
                                 <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden p-1 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                                    <SelectItem value="all" className="rounded-xl font-bold uppercase tracking-widest text-[10px] focus:bg-indigo-50 dark:focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-400 py-3">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-xl font-bold uppercase tracking-widest text-[10px] focus:bg-indigo-50 focus:text-indigo-600 py-3">{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                <SelectTrigger className="w-[180px] h-13 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500/50 font-medium transition-all text-slate-900 dark:text-zinc-100">
                                    <div className="flex items-center gap-2">
                                        <Check size={18} className="text-purple-600 dark:text-purple-400" />
                                        <SelectValue placeholder="Brands" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden p-1 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                                    <SelectItem value="all" className="rounded-xl font-bold uppercase tracking-widest text-[10px] focus:bg-purple-50 dark:focus:bg-purple-500/10 focus:text-purple-600 dark:focus:text-purple-400 py-3">All Brands</SelectItem>
                                    {brands.map(brand => (
                                        <SelectItem key={brand.id} value={brand.id.toString()} className="rounded-xl font-bold uppercase tracking-widest text-[10px] focus:bg-purple-50 focus:text-purple-600 py-3">{brand.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Product Grid Area */}
                <ScrollArea className="flex-1 px-1 -mx-1 cart-scrollbar">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 py-1 pb-10">
                        {productsLoading ? (
                            <div className="col-span-full h-80 flex flex-col items-center justify-center text-slate-300">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
                                    <Loader2 size={48} className="animate-spin text-indigo-500 relative z-10" />
                                </div>
                                <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse text-center">Initializing Inventory</p>
                            </div>
                        ) : visibleProducts.length > 0 ? (
                            visibleProducts.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="group relative flex flex-col cursor-pointer transition-all duration-500 hover:-translate-y-1"
                                >
                                    <div className="absolute inset-3 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                    <div className={cn(
                                        "relative flex flex-col h-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm transition-all group-hover:shadow-lg group-hover:border-indigo-200 dark:group-hover:border-indigo-800",
                                        product.stock_quantity <= 0 && "opacity-60 grayscale-[0.5]"
                                    )}>
                                        <div className="aspect-[214/300] relative flex items-center justify-center bg-slate-50/50 dark:bg-zinc-800/50 overflow-hidden text-zinc-900 dark:text-zinc-100">
                                            {product.image_url || product.image_path ? (
                                                <img 
                                                    src={getAssetUrl(product.image_url || product.image_path)} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out" 
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 opacity-10">
                                                    <Layers size={48} className="text-slate-900" />
                                                </div>
                                            )}

                                            {product.stock_quantity <= 0 ? (
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] py-2 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-[0.2em] text-center rotate-[-15deg] shadow-xl border border-red-400 z-20">
                                                    Out of Stock
                                                </div>
                                            ) : (
                                                <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center border border-slate-200 opacity-0 group-hover:opacity-100 transition duration-300 translate-y-2 group-hover:translate-y-0 text-indigo-600 shadow-sm">
                                                    <Plus size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col gap-1.5 text-zinc-900 dark:text-zinc-100">
                                            <div className="flex flex-col">
                                                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 leading-tight">{product.name}</h3>
                                                 <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-300 mt-0.5">
                                                    {categories.find(c => c.id === product.category_id)?.name || "Apparel"}
                                                </p>
                                            </div>
                                            <div className="flex items-end justify-between mt-1">
                                                 <span className="font-black text-lg tracking-tighter text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors origin-left">
                                                    ${product.sales_price}
                                                </span>
                                                <div className={cn(
                                                    "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm transition-all",
                                                    product.stock_quantity <= 0
                                                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700"
                                                        : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-indigo-500/20"
                                                )}>
                                                    {product.stock_quantity <= 0 ? (
                                                        "No Stock"
                                                    ) : (
                                                        <>Qty: {product.stock_quantity}</>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full h-80 flex flex-col items-center justify-center text-slate-300">
                                <Search size={64} className="opacity-20 mb-6" />
                                <p className="text-xl font-medium italic opacity-40">No items matching your criteria.</p>
                            </div>
                        )}
                        {!productsLoading && filteredProducts.length > visibleCount && (
                            <div className="col-span-full py-8 flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setVisibleCount(prev => prev + 50)}
                                    className="rounded-xl font-bold uppercase tracking-widest text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                >
                                    Load More Products
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Payment Selection Section */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0 pt-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm h-full flex flex-col gap-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600/70 dark:text-indigo-400/70">Quick Gateway Selection</p>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: "Cash", icon: Banknote, color: "from-emerald-500 to-teal-600 shadow-emerald-500/20", border: "border-emerald-200", text: "text-emerald-600" },
                                { id: "Card", icon: CreditCard, color: "from-blue-500 to-indigo-600 shadow-blue-500/20", border: "border-blue-200", text: "text-blue-600" },
                                { id: "PayPal", icon: Coins, color: "from-sky-400 to-blue-500 shadow-sky-500/20", border: "border-sky-200", text: "text-sky-600" },
                                { id: "Interac", icon: Coins, color: "from-rose-500 to-orange-600 shadow-rose-500/20", border: "border-rose-200", text: "text-rose-600" },
                            ].map(method => (
                                 <button
                                    key={method.id}
                                    onClick={() => setPaymentMode(method.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1.5 px-1 py-3 rounded-xl border transition-all active:scale-95 group",
                                        paymentMode === method.id
                                            ? cn("bg-gradient-to-br border-transparent shadow-lg -translate-y-0.5 ring-2 ring-white/20", method.color)
                                            : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-slate-50/50 dark:hover:bg-zinc-700/50 shadow-sm"
                                    )}
                                >
                                    <method.icon
                                        size={18}
                                        className={cn(
                                            "transition-all duration-300",
                                            paymentMode === method.id ? "text-white scale-110" : "text-slate-300 group-hover:text-slate-400"
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "font-black uppercase tracking-tighter text-[9px] transition-all duration-300",
                                            paymentMode === method.id ? "text-white scale-110" : "text-slate-400 group-hover:text-slate-600"
                                        )}
                                    >
                                        {method.id}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                     <div className="bg-white/40 dark:bg-zinc-900/40 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 group hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-default">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-300 dark:text-zinc-600 group-hover:text-indigo-400 transition-colors">
                            <Plus size={20} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-zinc-600 group-hover:text-slate-400 dark:group-hover:text-zinc-500 transition-colors italic">Reserved Space</p>
                    </div>
                </div>
            </div>

            {/* Right Column: Shopping Cart */}
            <div className="w-[420px] flex flex-col h-full relative group/cart">
                <div className="relative flex-1 flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-500/10 dark:shadow-none">
                    <div className="py-4 px-6 border-b border-indigo-100 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 shrink-0 relative overflow-hidden text-slate-900 dark:text-zinc-100">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30"></div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
                                    <div className="h-full w-full bg-white dark:bg-zinc-900 rounded-[15px] flex items-center justify-center">
                                        <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                </div>
                                 <div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-rose-500 bg-clip-text text-transparent pr-1 truncate">Shopping Cart</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mt-1">{cart.length} Items</p>
                                </div>
                            </div>
                             <button
                                onClick={() => setCart([])}
                                className="h-10 w-10 rounded-2xl bg-white dark:bg-zinc-800 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 shadow-lg shadow-rose-500/10 hover:shadow-xl hover:shadow-rose-500/20 flex items-center justify-center transition-all group/clear text-rose-400"
                                title="Clear Cart"
                            >
                                <Trash2 size={16} className="group-hover/clear:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                     <div className="flex-1 overflow-y-auto cart-scrollbar min-h-0 bg-slate-50/30 dark:bg-zinc-950/30">
                        <div className="space-y-3 px-4 py-4">
                            {cart.map(item => (
                                <div key={item.id} className="group/item flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-1000"></div>
                                    <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                                        {item.image_url || item.image_path ? (
                                            <img 
                                                src={getAssetUrl(item.image_url || item.image_path)} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                                            />
                                        ) : (
                                            <span className="text-xl font-black italic text-indigo-500/40">[{item.name[0]}]</span>
                                        )}
                                    </div>
                                     <div className="flex-1 min-w-0 relative z-10">
                                        <div className="flex items-start justify-between">
                                            <h4 className="font-bold text-slate-800 dark:text-zinc-200 truncate pr-2 group-hover/item:text-indigo-900 dark:group-hover/item:text-indigo-400 transition-colors uppercase italic tracking-tighter text-sm">{item.name}</h4>
                                             <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="h-6 w-6 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-400 dark:text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center shrink-0 transition-all shadow-sm"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                             <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-slate-50 dark:bg-zinc-800 rounded-full border border-slate-200 dark:border-zinc-700 p-0.5 shadow-sm">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-400 dark:text-zinc-500 transition-colors"><Minus size={10} /></button>
                                                    <span className="w-6 text-center text-xs font-black text-slate-700 dark:text-zinc-300">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="h-6 w-6 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:scale-105 transition-all"><Plus size={10} /></button>
                                                </div>
                                                <div className="flex items-center gap-1 group/price relative">
                                                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">x</span>
                                                    <div className="relative">
                                                        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">$</span>
                                                     <input
                                                            type="number"
                                                            className="w-16 h-6 pl-3.5 pr-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-black text-slate-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            value={item.cart_price ?? item.sales_price ?? 0}
                                                            onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                             <span className="font-black text-slate-900 dark:text-zinc-100 italic text-sm">${((item.cart_price || item.sales_price) * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                 <div className="h-80 flex flex-col items-center justify-center text-slate-300 dark:text-zinc-500">
                                    <ShoppingCart size={80} className="opacity-20 mb-6" />
                                    <p className="font-bold italic uppercase tracking-widest text-[10px] opacity-100 dark:text-zinc-200">Cart is empty</p>
                                </div>
                            )}
                        </div>
                    </div>

                     <div className="p-6 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 space-y-4 shrink-0 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
                        <div className="space-y-2">
                             <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-400">Order Summary</h3>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-200 tracking-tight">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900 dark:text-zinc-100 font-black">${totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-200 tracking-tight">
                                    <span>GST (5.00%)</span>
                                    <span className="text-slate-900 dark:text-zinc-100 font-black">${totals.gst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-200 tracking-tight">
                                    <span>QST (9.975%)</span>
                                    <span className="text-slate-900 dark:text-zinc-100 font-black">${totals.qst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-200 tracking-tight">
                                    <div className="flex items-center gap-2">
                                        <span>Discount</span>
                                        <input
                                            type="number"
                                            className="w-16 h-5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-1 text-[9px] font-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <span className="text-rose-600 dark:text-rose-400 font-black">-${Number(discount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center group/total py-2 text-slate-900 dark:text-zinc-100">
                              <span className="text-xl font-black italic uppercase tracking-tighter text-slate-400 dark:text-zinc-100 group-hover/total:text-indigo-600 dark:group-hover/total:text-indigo-400 transition-colors">Grand Total</span>
                            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent italic tracking-tight transition-all pr-1">
                                ${totals.total.toFixed(2)}
                            </span>
                        </div>

                        <button
                            disabled={cart.length === 0 || loading}
                            onClick={() => setIsConfirmOpen(true)}
                            className="relative w-full h-14 rounded-full overflow-hidden group/pay transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale shadow-lg shadow-orange-500/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 transition-colors" />
                            <div className="relative flex items-center justify-center gap-3">
                                {loading ? (
                                    <Loader2 className="animate-spin text-white" size={24} />
                                ) : (
                                    <>
                                        <CreditCard size={20} className="text-white group-hover/pay:rotate-12 transition-transform" />
                                        <span className="text-lg font-black italic uppercase tracking-[0.1em] text-white">COMPLETE SALE</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

             {/* Checkout Confirmation Modal */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[40px] p-8 shadow-2xl text-slate-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center font-black uppercase tracking-tighter text-3xl italic text-slate-900 dark:text-zinc-100 leading-none">Confirm <span className="text-indigo-600 dark:text-indigo-400">Checkout</span></DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 mt-6">
                        {/* Summary Card */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-3">
                            <div className="flex justify-between items-center opacity-40">
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Subtotal</span>
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Items: {cart.length}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-black/5 pb-3">
                                <span className="text-xl font-black italic tracking-tighter text-slate-700 leading-none">${totals.subtotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount</label>
                                <div className="relative w-32 group/discount">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/discount:text-indigo-600 font-black">$</div>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                         className="h-10 pl-7 text-right rounded-xl border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-black text-sm pr-3 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-zinc-100"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-2 pt-2 border-t border-indigo-100/50">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 block">Grand Total</span>
                                    <span className="text-3xl font-black italic tracking-tighter text-indigo-700 leading-none">${totals.roundedTotal.toFixed(2)}</span>
                                </div>
                                 <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                    <input
                                        type="checkbox"
                                        id="roundOff"
                                        checked={isRounded}
                                        onChange={(e) => setIsRounded(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded border-indigo-300 focus:ring-indigo-500 transition-all cursor-pointer accent-indigo-600"
                                    />
                                    <label htmlFor="roundOff" className="text-[10px] font-black uppercase tracking-widest text-indigo-700 cursor-pointer select-none">Round Off</label>
                                </div>
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Payment Status</label>
                            <div className="grid grid-cols-4 gap-2">
                                {["Paid", "Partial", "Unpaid", "Split"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setCheckoutStatus(status as any)}
                                        className={cn(
                                            "h-12 rounded-2xl font-black uppercase tracking-tighter text-[11px] border transition-all active:scale-95",
                                             checkoutStatus === status
                                                ? "bg-indigo-600 border-transparent text-white shadow-lg shadow-indigo-600/20"
                                                : "bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-500 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                                        )}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Paid Amount Input */}
                        <div className="space-y-3">
                             {checkoutStatus === "Split" ? (
                                <div className="space-y-3 bg-slate-50/50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Cash", state: splitCash, setter: setSplitCash },
                                            { label: "Card", state: splitCard, setter: setSplitCard },
                                            { label: "PayPal", state: splitPaypal, setter: setSplitPaypal },
                                            { label: "Interac", state: splitInterac, setter: setSplitInterac },
                                        ].map((method) => (
                                            <div key={method.label} className="relative group/input">
                                                <label className="absolute left-3 top-1 text-[9px] font-black uppercase tracking-widest text-slate-400">{method.label}</label>
                                                <div className="absolute left-3 top-6 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors font-black text-sm">$</div>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={method.state}
                                                     onChange={(e) => method.setter(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                                    className="h-12 pl-6 pt-5 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 font-black text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 dark:text-zinc-100"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                     <div className="flex justify-between items-center py-2 border-t border-slate-200 dark:border-zinc-800 border-dashed mt-2">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">Split Total</span>
                                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">${Number(checkoutPaidAmount).toFixed(2)}</span>
                                    </div>
                                    {Number(checkoutPaidAmount) < totals.roundedTotal ? (
                                         <p className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-tight bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2 border border-amber-100 dark:border-amber-900/30 italic">
                                            Remaining Due: ${(totals.roundedTotal - Number(checkoutPaidAmount)).toFixed(2)} will be record as debt.
                                        </p>
                                    ) : Number(checkoutPaidAmount) > totals.roundedTotal ? (
                                         <p className="text-[14px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2 border border-emerald-100 dark:border-emerald-900/30 italic">
                                            Change Return: ${(Number(checkoutPaidAmount) - totals.roundedTotal).toFixed(2)}
                                        </p>
                                    ) : null}
                                </div>
                            ) : (
                                <>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
                                        Amount (Customer Gave)
                                    </label>
                                    <div className="relative group/input">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors font-black text-lg">$</div>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={checkoutPaidAmount}
                                             onChange={(e) => setCheckoutPaidAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                            className="h-14 pl-10 rounded-2xl border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 font-black text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 dark:text-zinc-100"
                                        />
                                    </div>
                                     {checkoutStatus === "Paid" && Number(checkoutPaidAmount) > totals.roundedTotal && (
                                        <p className="text-[14px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight pl-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2 border border-emerald-100 dark:border-emerald-900/30 italic mt-2">
                                            Change Return: ${(Number(checkoutPaidAmount) - totals.roundedTotal).toFixed(2)}
                                        </p>
                                    )}
                                    {checkoutStatus === "Paid" && Number(checkoutPaidAmount) < totals.roundedTotal && (
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight pl-1 bg-amber-50 rounded-lg p-2 border border-amber-100 italic mt-2">
                                            Warning: Amount is less than Grand Total. Should this be Partial?
                                        </p>
                                    )}
                                    {checkoutStatus === "Partial" && (
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight pl-1 bg-amber-50 rounded-lg p-2 border border-amber-100 italic mt-2">
                                            Remaining Due: ${Math.max(0, totals.roundedTotal - Number(checkoutPaidAmount)).toFixed(2)} will be record as debt.
                                        </p>
                                    )}
                                    {checkoutStatus === "Unpaid" && (
                                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight pl-1 bg-rose-50 rounded-lg p-2 border border-rose-100 italic mt-2">
                                            Full amount of ${totals.roundedTotal.toFixed(2)} will be marked as due.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                             <button
                                className="flex-1 h-14 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-black uppercase tracking-widest text-[11px] text-slate-400 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all active:scale-95 text-slate-900 dark:text-zinc-100"
                                onClick={() => setIsConfirmOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="relative flex-[2] h-14 rounded-full overflow-hidden group/pay transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale shadow-lg shadow-orange-500/30"
                                onClick={handleCheckout}
                                disabled={loading || (checkoutStatus === "Split" && Number(checkoutPaidAmount) < totals.roundedTotal - 0.01) || (checkoutStatus === "Paid" && Number(checkoutPaidAmount) < totals.roundedTotal)}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 transition-colors" />
                                <div className="relative flex items-center justify-center gap-3">
                                    {loading ? <Loader2 className="animate-spin text-white" size={18} /> : <Check size={18} className="text-white group-hover/pay:rotate-12 transition-transform" />}
                                    <span className="text-white font-black uppercase tracking-widest text-[11px]">Confirm Sale</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

             {/* Receipt Modal */}
            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent className="max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[40px] p-8 shadow-2xl text-slate-900 dark:text-zinc-100">
                    <DialogHeader>
                        <DialogTitle className="text-center font-black uppercase tracking-tighter text-3xl italic text-slate-900 dark:text-zinc-100 leading-none">Sale <span className="text-indigo-600 dark:text-indigo-400">Confirmed</span></DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[70vh] pr-4 -mr-4 cart-scrollbar">
                        <div ref={receiptRef} className="bg-white text-zinc-900 rounded-2xl p-6 font-mono text-[10px] shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                            <div className="flex flex-col items-center mb-3">
                                <div className="h-10 w-10 flex items-center justify-center mb-1">
                                    {currentCompany?.logo_url || currentCompany?.logo_path ? (
                                        <img
                                            src={getAssetUrl(currentCompany.logo_url || currentCompany.logo_path)}
                                            alt="Logo"
                                            className="h-full w-auto object-contain logo-img"
                                        />
                                    ) : (
                                         <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center border border-indigo-100 dark:border-zinc-700 logo-div">
                                            <ShoppingCart size={20} className="text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-black text-xs uppercase tracking-tight leading-none text-center">{currentCompany?.name || '9416-3169 Quebec Inc.'}</h3>
                                <p className="opacity-60 text-[8px] text-center">{currentCompany?.pos_receipt_address || 'Quebec, Canada'}</p>
                                <p className="opacity-60 text-[8px] text-center font-black text-indigo-600 mt-1">INV: {lastSale?.sales_code?.replace('SL/', '')}, DT: {new Date().toLocaleString()}</p>
                                <div className="mt-1 flex flex-col items-center opacity-70 text-[8px] font-bold uppercase tracking-wider text-slate-600 space-y-0.5">
                                    <div className="flex gap-2 text-center justify-center w-full">
                                        <span>{currentCompany?.tax_id || 'N/A'}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span>Cus: {lastSale?.customer_name || customerName}</span>
                                        <span className="opacity-30">|</span>
                                        <span>Mob: {lastSale?.customer_mobile || customerMobile}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="divider" style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

                            <div className="space-y-1 my-3 text-slate-900 font-mono">
                                <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest opacity-40 mb-2 pb-1 border-b border-dotted border-black">
                                    <span className="w-1/2">Description</span>
                                    <span className="w-1/4 text-center">Qty</span>
                                    <span className="w-1/4 text-right">Total</span>
                                </div>
                                {lastSale?.items?.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-start text-[9px]">
                                        <span className="w-1/2 truncate pr-2 font-bold uppercase">{item.product?.name || 'Product'}</span>
                                        <span className="w-1/4 text-center">{Number(item.quantity).toFixed(0)}</span>
                                        <span className="w-1/4 text-right font-black">${Number(item.total_amount).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="divider" style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

                            <div className="space-y-0.5 my-3 opacity-80 text-slate-900 font-mono">
                                <div className="flex justify-between items-center text-[9px]">
                                    <span className="uppercase tracking-widest text-[8px] font-bold">Subtotal (Excl. Tax)</span>
                                    <span className="font-black">${Number(lastSale?.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px]">
                                    <span className="uppercase tracking-widest text-[8px] font-bold">GST (5.00%)</span>
                                    <span className="font-black">${Number(lastSale?.subtotal ? (lastSale.subtotal * GST_RATE) : 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px]">
                                    <span className="uppercase tracking-widest text-[8px] font-bold">QST (9.975%)</span>
                                    <span className="font-black">${Number(lastSale?.subtotal ? (lastSale.subtotal * QST_RATE) : 0).toFixed(2)}</span>
                                </div>
                                {(Number(lastSale?.discount_amount || 0) > 0 || Number(lastSale?.discount_on_all || 0) > 0) && (
                                    <div className="flex justify-between items-center text-[9px]">
                                        <span className="uppercase tracking-widest text-[8px] font-bold">Discount</span>
                                        <span className="font-black">-${Number(lastSale.discount_amount || lastSale.discount_on_all).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-[10px] mt-2 pt-1 border-t border-dotted border-black">
                                    <span className="uppercase tracking-widest text-[8px] font-bold">Grand Total</span>
                                    <span className="font-black">${Number(lastSale?.grand_total || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] mt-1 text-emerald-700">
                                    <span className="uppercase tracking-widest text-[8px] font-bold">Paid Amount</span>
                                    <span className="font-black">${Number(checkoutPaidAmount || lastSale?.paid_amount || 0).toFixed(2)}</span>
                                </div>
                                {Number(checkoutPaidAmount) > Number(lastSale?.grand_total || 0) && (
                                    <div className="flex justify-between items-center text-[9px] mt-1 text-emerald-700">
                                        <span className="uppercase tracking-widest text-[8px] font-bold">Change Return</span>
                                        <span className="font-black">${(Number(checkoutPaidAmount) - Number(lastSale?.grand_total || 0)).toFixed(2)}</span>
                                    </div>
                                )}
                                {(Number(lastSale?.grand_total || 0) - Number(checkoutPaidAmount || lastSale?.paid_amount || 0) > 0) && (
                                    <div className="flex justify-between items-center text-[9px] mt-1 text-rose-600">
                                        <span className="uppercase tracking-widest text-[8px] font-bold">Due</span>
                                        <span className="font-black">${(Number(lastSale?.grand_total || 0) - Number(checkoutPaidAmount || lastSale?.paid_amount || 0)).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="text-center mt-6 space-y-2">
                                 <div className="payment-badge inline-block px-4 py-1.5 border border-slate-900 dark:border-zinc-500 rounded-lg bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] text-[8px] font-black uppercase tracking-widest text-slate-900 dark:text-zinc-100 italic">
                                    [{lastSale?.payment_type || paymentMode}] SALE
                                </div>
                                <p className="text-[8px] font-black italic uppercase tracking-[0.1em] text-indigo-600 dark:text-indigo-400 opacity-60">Merci pour votre confiance!</p>

                                {(currentCompany?.pos_email || currentCompany?.pos_website || currentCompany?.pos_mobile) && (
                                    <div className="mt-4 pt-4 border-t border-dotted border-black space-y-1">
                                        {currentCompany?.pos_email && <p className="text-[7px] font-bold uppercase">{currentCompany.pos_email}</p>}
                                        {(currentCompany?.pos_website || currentCompany?.pos_mobile) && (
                                            <p className="text-[7px] font-bold uppercase">
                                                {currentCompany.pos_website} {currentCompany.pos_website && currentCompany.pos_mobile && "|"} {currentCompany.pos_mobile}
                                            </p>
                                        )}
                                    </div>
                                )}

                                    {currentCompany?.qr_code_url || currentCompany?.qr_code_path ? (
                                        <div className="mt-4 flex flex-col items-center gap-1">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-rose-500">Review on Google Business</p>
                                            <img
                                                src={getAssetUrl(currentCompany.qr_code_url || currentCompany.qr_code_path)}
                                                alt="Review QR"
                                                className="qr-img"
                                            />
                                        </div>
                                    ) : null}
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="flex gap-3 mt-8">
                        <button
                            className="flex-1 h-14 rounded-2xl bg-white border border-slate-200 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                            onClick={handleSendEmail}
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} className="text-indigo-500" />}
                            Email
                        </button>
                        <button
                            className="flex-[2] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                            onClick={printReceipt}
                        >
                            <Printer size={16} /> Print Receipt
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
