"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { SaleService, SaleItem } from "@/lib/sales-purchase-service";
import { WarehouseService, Warehouse } from "@/lib/warehouse-service";
import { ContactService } from "@/lib/contact-service";
import { ProductService } from "@/lib/product-service";
import { TaxService } from "@/lib/tax-bank-service";
import { AccountService } from "@/lib/accounting-import-service";
import { WhatsappService } from "@/lib/whatsapp-service";
import { EmailService } from "@/lib/email-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Trash2,
    Search,
    UserPlus,
    Calendar,
    ArrowLeft,
    Save,
    QrCode,
    Receipt,
    ShoppingCart,
    Minus,
    Loader2,
    Edit2,
    Mail,
    Phone,
    MessageCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EditSalePage() {
    const router = useRouter();
    const params = useParams();
    const saleId = Number(params.id);
    const { currentCompany } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [sale, setSale] = useState<any>(null);
    const [sendWhatsapp, setSendWhatsapp] = useState(true);
    const [whatsappConfig, setWhatsappConfig] = useState<any>(null);
    const [sendEmail, setSendEmail] = useState(true);
    const [emailConfig, setEmailConfig] = useState<any>(null);

    // Master Data
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [taxes, setTaxes] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [previousPayments, setPreviousPayments] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        warehouse_id: "",
        customer_id: "",
        customer_email: "",
        customer_mobile: "",
        sales_date: new Date().toISOString().split('T')[0],
        due_date: "",
        reference_no: "",
        other_charges: 0,
        discount_on_all: 0,
        discount_type: 'Percentage' as 'Percentage' | 'Fixed',
        note: "",
        terms_and_conditions: "",
        status: 'Final' as 'Final' | 'Quotation' | 'Proforma',
        paid_amount: 0,
        payment_type: 'Cash',
        account_id: "",
        payment_note: "",
    });

    const [items, setItems] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Load master data & sale
    useEffect(() => {
        if (!currentCompany) return;

        const fetchAll = async () => {
            try {
                const [whs, contacts, prods, txs, accs, saleData] = await Promise.all([
                    WarehouseService.getAll(currentCompany.id),
                    ContactService.getAll(currentCompany.id),
                    ProductService.getAll(currentCompany.id),
                    TaxService.getAll(currentCompany.id),
                    AccountService.getAll(currentCompany.id),
                    SaleService.getById(saleId),
                ]);

                setWarehouses(whs);
                setCustomers(contacts.filter((c: any) => c.type === 'customer'));
                setProducts(prods);
                setTaxes(txs);
                setAccounts(accs);
                setSale(saleData);
                setPreviousPayments(saleData.payments || []);

                // Fetch active WhatsApp config
                WhatsappService.getConfigurations().then(configs => {
                    const active = configs.find(c => c.is_active);
                    if (active) setWhatsappConfig(active);
                }).catch(() => { });
                // Fetch active Email config
                EmailService.getConfigurations().then(configs => {
                    const active = configs.find(c => c.is_active);
                    if (active) setEmailConfig(active);
                }).catch(() => { });

                // Pre-fill form
                setFormData({
                    warehouse_id: String(saleData.warehouse_id || (whs[0]?.id ?? "")),
                    customer_id: String(saleData.customer_id || ""),
                    customer_email: saleData.customer_email || saleData.customer?.email || "",
                    customer_mobile: saleData.customer_mobile || saleData.customer?.mobile || "",
                    sales_date: saleData.sales_date || new Date().toISOString().split('T')[0],
                    due_date: saleData.due_date || "",
                    reference_no: saleData.reference_no || "",
                    other_charges: Number(saleData.other_charges) || 0,
                    discount_on_all: Number(saleData.discount_on_all) || 0,
                    discount_type: (saleData.discount_type as any) || 'Percentage',
                    note: saleData.note || "",
                    terms_and_conditions: saleData.terms_and_conditions || "",
                    status: (saleData.status as any) || 'Final',
                    paid_amount: Number(saleData.paid_amount) || 0,
                    payment_type: saleData.payment_type || 'Cash',
                    account_id: String(saleData.payments?.[0]?.account_id || ""),
                    payment_note: saleData.payments?.[0]?.note || "",
                });

                // Pre-fill items
                const mappedItems = (saleData as any).items?.map((item: any) => ({
                    product_id: item.product_id,
                    name: item.product?.name || `Product #${item.product_id}`,
                    quantity: Number(item.quantity),
                    unit_price: Number(item.unit_price),
                    discount_amount: Number(item.discount_amount) || 0,
                    tax_id: item.tax_id,
                    tax_amount: Number(item.tax_amount) || 0,
                    total_amount: Number(item.total_amount),
                })) || [];

                setItems(mappedItems);
            } catch (error) {
                toast.error("Failed to load sale data");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchAll();
    }, [currentCompany, saleId]);

    const selectedCustomer = useMemo(() => {
        return customers.find(c => c.id.toString() === formData.customer_id);
    }, [customers, formData.customer_id]);

    // Calculations
    const totals = useMemo(() => {
        const subtotal = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unit_price), 0);
        const taxAmount = items.reduce((acc: number, item: any) => acc + (item.tax_amount || 0), 0);

        let globalDiscount = 0;
        if (formData.discount_type === 'Percentage') {
            globalDiscount = subtotal * (formData.discount_on_all / 100);
        } else {
            globalDiscount = formData.discount_on_all;
        }

        const grandTotal = subtotal + Number(formData.other_charges) - globalDiscount + taxAmount;
        const currentBalance = grandTotal - Number(formData.paid_amount);

        // When editing, we need to adjust the total due because the current sale's ORIGINAL due is already part of the customer's previous_due.
        const originalSaleDue = sale ? (Number(sale.grand_total) - Number(sale.paid_amount)) : 0;
        const totalDue = currentBalance + (Number(selectedCustomer?.previous_due || 0) - originalSaleDue);

        // Calculate payment status
        let paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID';
        if (formData.paid_amount > 0) {
            if (formData.paid_amount >= grandTotal) {
                paymentStatus = 'PAID';
            } else {
                paymentStatus = 'PARTIAL';
            }
        }

        return { subtotal, taxAmount, globalDiscount, grandTotal, balance: totalDue, paymentStatus };
    }, [items, formData.other_charges, formData.discount_on_all, formData.discount_type, formData.paid_amount, selectedCustomer, sale]);

    const getDynamicFontSize = (text: string, type: 'grandTotal' | 'paidAmount' | 'balanceDue') => {
        const length = text.length;
        if (type === 'grandTotal') {
            if (length > 18) return 'text-base md:text-lg lg:text-xl';
            if (length > 15) return 'text-lg md:text-xl lg:text-2xl';
            return 'text-xl md:text-2xl lg:text-3xl';
        }
        if (type === 'paidAmount') {
            if (length > 15) return 'text-xs md:text-sm';
            return 'text-sm md:text-base lg:text-lg';
        }
        if (type === 'balanceDue') {
            if (length > 15) return 'text-[10px] md:text-xs';
            return 'text-xs md:text-sm';
        }
        return '';
    };

    const addItem = (product: any) => {
        if (product.stock_quantity <= 0) {
            toast.error("Product is out of stock!");
            return;
        }
        const existing = items.find((i: any) => i.product_id === product.id);
        if (existing) {
            setItems(items.map((i: any) => i.product_id === product.id
                ? { ...i, quantity: i.quantity + 1, total_amount: (i.quantity + 1) * i.unit_price }
                : i
            ));
        } else {
            setItems([...items, {
                product_id: product.id,
                name: product.name,
                quantity: 1,
                unit_price: product.sales_price,
                discount_amount: 0,
                tax_id: product.tax_id,
                tax_amount: 0,
                total_amount: product.sales_price
            }]);
        }
        setSearchQuery("");
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].total_amount = newItems[index].quantity * newItems[index].unit_price;
        }
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_: any, i: number) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCompany) return;
        if (items.length === 0) {
            toast.error("Please add at least one item");
            return;
        }

        setLoading(true);
        try {
            await SaleService.update(saleId, {
                ...formData,
                company_id: currentCompany.id,
                warehouse_id: Number(formData.warehouse_id),
                customer_id: Number(formData.customer_id),
                subtotal: totals.subtotal,
                grand_total: totals.grandTotal,
                items: items,
                account_id: formData.account_id ? Number(formData.account_id) : undefined,
            });
            toast.success("Invoice updated successfully");

            // Send WhatsApp notification if enabled
            if (sendWhatsapp && whatsappConfig && selectedCustomer?.mobile) {
                try {
                    await WhatsappService.sendInvoiceNotification(whatsappConfig.id, selectedCustomer.mobile, {
                        sales_code: sale?.sales_code || 'N/A',
                        customer_name: selectedCustomer.name,
                        grand_total: totals.grandTotal,
                        paid_amount: formData.paid_amount,
                        sales_date: formData.sales_date,
                        company_name: currentCompany.name,
                    });
                    toast.success("WhatsApp notification sent!");
                } catch {
                    toast.warning("Invoice saved, but WhatsApp notification failed.");
                }
            }

            // Send Email notification if enabled
            if (sendEmail && emailConfig && selectedCustomer?.email) {
                try {
                    await EmailService.sendInvoiceEmail(emailConfig.id, selectedCustomer.email, {
                        sales_code: sale?.sales_code || 'N/A',
                        customer_name: selectedCustomer.name,
                        grand_total: totals.grandTotal,
                        paid_amount: formData.paid_amount,
                        balance_due: totals.grandTotal - formData.paid_amount,
                        sales_date: formData.sales_date,
                        company_name: currentCompany.name,
                        items: items.map((item: any) => ({
                            name: item.name,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            total_amount: item.total_amount,
                        })),
                    });
                    toast.success("Email notification sent!");
                } catch {
                    toast.warning("Invoice saved, but email notification failed.");
                }
            }

            router.push("/sales");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update invoice");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = searchQuery.length > 0
        ? products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.item_code?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5)
        : [];

    if (initialLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                    <p className="text-zinc-500 font-bold tracking-widest text-sm uppercase">Loading Invoice...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 h-10 w-10 md:h-12 md:w-12"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tighter uppercase leading-tight mb-1">
                                Edit Invoice
                            </h2>
                            {sale?.sales_code && (
                                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 px-4 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
                                    {sale.sales_code}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            Update the sale record and inventory will be adjusted automatically.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="rounded-full border-zinc-200 dark:border-zinc-800 font-bold text-[10px] uppercase tracking-widest px-6 h-12"
                    >
                        Cancel
                    </Button>
                    <Button
                        form="edit-invoice-form"
                        disabled={loading}
                        className="rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-[10px] uppercase tracking-widest px-8 shadow-xl shadow-indigo-500/20 border-0 h-12 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                        Update Invoice
                    </Button>
                </div>
            </div>

            <form id="edit-invoice-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Form Area */}
                <div className="xl:col-span-3 space-y-6">
                    {/* Basic Info */}
                    <Card className="border-0 bg-white dark:bg-zinc-900 shadow-2xl shadow-violet-500/5 rounded-xl overflow-hidden">
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Warehouse*</Label>
                                    <Select
                                        value={formData.warehouse_id}
                                        onValueChange={(v) => setFormData(prev => ({ ...prev, warehouse_id: v }))}
                                    >
                                        <SelectTrigger className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-violet-500/20 transition-all font-bold">
                                            <SelectValue placeholder="Select Warehouse" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl">
                                            {warehouses.map(w => (
                                                <SelectItem key={w.id} value={w.id.toString()} className="rounded-xl my-1">{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Customer Name*</Label>
                                        {selectedCustomer && (
                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-tight">
                                                (Previous Due: ${Number(selectedCustomer.previous_due || 0).toFixed(2)})
                                            </span>
                                        )}
                                    </div>
                                    <Select
                                        value={formData.customer_id}
                                        onValueChange={(v) => {
                                            const customer = customers.find(c => c.id.toString() === v);
                                            setFormData(prev => ({
                                                ...prev,
                                                customer_id: v,
                                                customer_email: customer?.email || prev.customer_email,
                                                customer_mobile: customer?.mobile || prev.customer_mobile
                                            }));
                                        }}
                                    >
                                        <SelectTrigger className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-violet-500/20 transition-all font-bold">
                                            <SelectValue placeholder="Select Customer" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl">
                                            {customers.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()} className="rounded-xl my-1">{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Customer Email</Label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            placeholder="Enter customer email"
                                            value={formData.customer_email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                                            className="h-12 pl-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-violet-500/20 transition-all font-bold"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Customer Mobile</Label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Enter customer mobile"
                                            value={formData.customer_mobile}
                                            onChange={(e) => setFormData(prev => ({ ...prev, customer_mobile: e.target.value }))}
                                            className="h-12 pl-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-violet-500/20 transition-all font-bold"
                                        />
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Sales Date*</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={formData.sales_date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sales_date: e.target.value }))}
                                            className="h-12 pl-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-violet-500/20 transition-all font-bold"
                                        />
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Due Date</Label>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={formData.due_date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                            className="h-12 pl-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-violet-500/20 transition-all font-bold"
                                        />
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Reference No</Label>
                                    <Input
                                        placeholder="Optional reference number"
                                        value={formData.reference_no}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reference_no: e.target.value }))}
                                        className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-violet-500/20 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(v: any) => setFormData(prev => ({ ...prev, status: v }))}
                                    >
                                        <SelectTrigger className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-violet-500/20 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="Final">Final</SelectItem>
                                            <SelectItem value="Quotation">Quotation</SelectItem>
                                            <SelectItem value="Proforma">Proforma</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Item Search & Table */}
                    <Card className="border-0 bg-white dark:bg-zinc-900 shadow-2xl shadow-violet-500/5 rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="p-8 pb-4">
                                <div className="relative group">
                                    <Input
                                        placeholder="Scan barcode or search items by name, code..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-14 pl-14 pr-14 bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-lg placeholder:text-zinc-400"
                                    />
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-violet-500 transition-colors" size={22} />
                                    <QrCode className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer hover:text-violet-500 transition-colors" size={22} />

                                    {filteredProducts.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] z-50 p-2 overflow-hidden">
                                            {filteredProducts.map(p => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => addItem(p)}
                                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-2xl transition-all group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                                            {p.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-zinc-900 dark:text-zinc-100">{p.name}</div>
                                                            <div className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">{p.item_code} | SKU: {p.sku || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-violet-600">${p.sales_price}</div>
                                                        <div className={cn(
                                                            "text-[10px] font-bold uppercase tracking-widest",
                                                            p.stock_quantity <= 0 ? "text-red-500" : "text-zinc-400"
                                                        )}>
                                                            {p.stock_quantity <= 0 ? "Out of Stock" : `Stock: ${p.stock_quantity}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto min-h-[300px]">
                                <Table>
                                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                                        <TableRow className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                                            <TableHead className="pl-8 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Item Name</TableHead>
                                            <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-center">Qty</TableHead>
                                            <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">Unit Price</TableHead>
                                            <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">Discount</TableHead>
                                            <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">Tax</TableHead>
                                            <TableHead className="pr-8 py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest text-right">Total</TableHead>
                                            <TableHead className="w-16"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item: any, idx: number) => (
                                            <TableRow key={idx} className="border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                                                <TableCell className="pl-8 py-6">
                                                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{item.name}</div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Input
                                                        type="number"
                                                        min={0.01}
                                                        step="0.01"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                                        className="h-10 w-20 mx-auto bg-transparent border-zinc-100 dark:border-zinc-800 rounded-xl text-center font-bold"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                                                        className="h-10 w-28 ml-auto bg-transparent border-zinc-100 dark:border-zinc-800 rounded-xl text-right font-bold"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="font-bold text-zinc-400">${item.discount_amount}</div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="font-bold text-zinc-400">${item.tax_amount}</div>
                                                </TableCell>
                                                <TableCell className="pr-8 text-right">
                                                    <div className="font-black text-violet-600">${Number(item.total_amount).toFixed(2)}</div>
                                                </TableCell>
                                                <TableCell className="pr-8">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(idx)}
                                                        className="h-10 w-10 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {items.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-40 text-center">
                                                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                                                        <ShoppingCart size={32} className="opacity-20" />
                                                        <span className="font-bold uppercase tracking-widest text-xs">Search and add products to update the invoice.</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Previous Payments Information */}
                    <div className="space-y-3">
                        <Label className="text-sm font-black text-zinc-500 uppercase tracking-widest pl-2">Previous Payments Information :</Label>
                        <Card className="border-0 bg-white dark:bg-zinc-900 shadow-xl shadow-black/5 rounded-2xl overflow-hidden">
                            <Table>
                                <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                                    <TableRow className="hover:bg-transparent border-b border-zinc-100 dark:border-zinc-800">
                                        <TableHead className="py-4 font-black text-xs text-black dark:text-white w-12 text-center uppercase tracking-widest">#</TableHead>
                                        <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Date</TableHead>
                                        <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Payment Type</TableHead>
                                        <TableHead className="py-4 font-black text-xs text-black dark:text-white uppercase tracking-widest">Payment Note</TableHead>
                                        <TableHead className="py-4 font-black text-xs text-black dark:text-white text-right uppercase tracking-widest">Payment</TableHead>
                                        <TableHead className="py-4 font-black text-xs text-black dark:text-white text-center uppercase tracking-widest">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previousPayments.length > 0 ? (
                                        previousPayments.map((p, idx) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="text-center font-bold text-zinc-400">{idx + 1}</TableCell>
                                                <TableCell className="font-medium text-zinc-600">{p.date}</TableCell>
                                                <TableCell className="font-medium text-zinc-600">{p.payment_type}</TableCell>
                                                <TableCell className="text-zinc-400">{p.note}</TableCell>
                                                <TableCell className="text-right font-black text-violet-600">${Number(p.amount).toFixed(2)}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow className="hover:bg-transparent border-0">
                                            <TableCell colSpan={6} className="h-16 text-center text-sm font-black text-zinc-400 uppercase tracking-widest">
                                                Payments Pending!!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Invoice Terms and Conditions</Label>
                            <div className="h-px flex-1 bg-violet-500/20 mx-4" />
                        </div>
                        <textarea
                            className="w-full min-h-[120px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 font-mono text-sm text-zinc-600 dark:text-zinc-400 focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500/20 transition-all outline-none resize-none shadow-inner"
                            placeholder="Type your terms and conditions here..."
                            value={formData.terms_and_conditions}
                            onChange={(e) => setFormData(prev => ({ ...prev, terms_and_conditions: e.target.value }))}
                        />
                    </div>

                    {/* Payment Section */}
                    <div className="space-y-4">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Payment Status</Label>
                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, paid_amount: totals.grandTotal }))}
                                    className={cn(
                                        "flex-1 h-14 rounded-full font-black uppercase tracking-widest transition-all border-zinc-200 dark:border-zinc-800",
                                        totals.paymentStatus === 'PAID'
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 border-0"
                                            : "bg-white dark:bg-zinc-900 border text-zinc-400"
                                    )}
                                >
                                    PAID
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        // Focus the paid amount field if partial is clicked
                                        document.getElementById('paid-amount-input')?.focus();
                                    }}
                                    className={cn(
                                        "flex-1 h-14 rounded-full font-black uppercase tracking-widest transition-all border-zinc-200 dark:border-zinc-800",
                                        totals.paymentStatus === 'PARTIAL'
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 border-0"
                                            : "bg-white dark:bg-zinc-900 border text-zinc-400"
                                    )}
                                >
                                    PARTIAL
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, paid_amount: 0 }))}
                                    className={cn(
                                        "flex-1 h-14 rounded-full font-black uppercase tracking-widest transition-all border-zinc-200 dark:border-zinc-800",
                                        totals.paymentStatus === 'UNPAID'
                                            ? "bg-zinc-800 text-white shadow-lg shadow-black/25 border-0"
                                            : "bg-white dark:bg-zinc-900 border text-zinc-400"
                                    )}
                                >
                                    UNPAID
                                </Button>
                            </div>
                        </div>

                        <Label className="text-lg font-black text-violet-600 block pt-4">Payment</Label>
                        <div className="text-xs font-bold text-zinc-500 mb-2">Advance: 0.00</div>

                        <div className="flex items-center gap-2 mb-4">
                            <input type="checkbox" id="adjust-advance" className="h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500" />
                            <label htmlFor="adjust-advance" className="text-xs font-bold text-zinc-600">Adjust Advance Payment</label>
                        </div>

                        <div className="bg-zinc-100 dark:bg-zinc-800/40 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border border-zinc-200/50 dark:border-zinc-800">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">Amount</Label>
                                <div className="relative">
                                    <Input
                                        id="paid-amount-input"
                                        type="number"
                                        value={formData.paid_amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paid_amount: Number(e.target.value) }))}
                                        className="h-12 text-right font-black text-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500/20"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Payment Type</Label>
                                <Select
                                    value={formData.payment_type}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, payment_type: v }))}
                                >
                                    <SelectTrigger className="h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold">
                                        <SelectValue placeholder="-Select-" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Account</Label>
                                <Select
                                    value={formData.account_id}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, account_id: v }))}
                                >
                                    <SelectTrigger className="h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold">
                                        <SelectValue placeholder="Select Account" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id.toString()} className="rounded-lg">{acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-3 space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Payment Note</Label>
                                <textarea
                                    className="w-full min-h-[80px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-medium focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500/20 transition-all outline-none resize-none"
                                    placeholder="Write any payment related notes..."
                                    value={formData.payment_note}
                                    onChange={(e) => setFormData(prev => ({ ...prev, payment_note: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 py-4 border-t border-zinc-100 dark:border-zinc-800/30">
                        {/* WhatsApp Notification Row */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="send-whatsapp-edit" checked={sendWhatsapp} onChange={(e) => setSendWhatsapp(e.target.checked)} className="h-5 w-5 rounded border-green-500 cursor-pointer accent-green-500" />
                                <label htmlFor="send-whatsapp-edit" className="text-sm font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-2 cursor-pointer">
                                    <MessageCircle size={16} className="text-green-500" /> WhatsApp Notification
                                </label>
                            </div>
                            {sendWhatsapp && !whatsappConfig && (<span className="text-[10px] font-bold text-amber-500 italic">(No active gateway)</span>)}
                            {sendWhatsapp && whatsappConfig && !selectedCustomer?.mobile && (<span className="text-[10px] font-bold text-amber-500 italic">(No mobile number)</span>)}
                            {sendWhatsapp && whatsappConfig && selectedCustomer?.mobile && (<span className="text-[10px] font-bold text-green-600 italic">→ {selectedCustomer.mobile}</span>)}
                        </div>
                        {/* Email Notification Row */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="send-email-edit" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="h-5 w-5 rounded border-indigo-500 cursor-pointer accent-indigo-500" />
                                <label htmlFor="send-email-edit" className="text-sm font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-2 cursor-pointer">
                                    <Mail size={16} className="text-indigo-500" /> Email Notification
                                </label>
                            </div>
                            {sendEmail && !emailConfig && (<span className="text-[10px] font-bold text-amber-500 italic">(No active email config)</span>)}
                            {sendEmail && emailConfig && !selectedCustomer?.email && (<span className="text-[10px] font-bold text-amber-500 italic">(No email address)</span>)}
                            {sendEmail && emailConfig && selectedCustomer?.email && (<span className="text-[10px] font-bold text-indigo-600 italic">→ {selectedCustomer.email}</span>)}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest h-14 shadow-xl shadow-violet-500/20 border-0"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                            Update Invoice
                        </Button>
                        <Button
                            type="button"
                            onClick={() => router.back()}
                            variant="outline"
                            className="flex-1 rounded-xl font-black uppercase tracking-widest h-14"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="border-0 bg-violet-600 dark:bg-violet-700 shadow-2xl shadow-violet-500/20 rounded-[32px] overflow-hidden sticky top-24">
                        <CardContent className="p-8 space-y-8 text-white">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 italic">Grand Total</p>
                                <h3 className={cn(
                                    "font-black tracking-tighter transition-all duration-300",
                                    getDynamicFontSize(`$ ${Number(totals.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'grandTotal')
                                )}>
                                    $ {Number(totals.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-white/10">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Discount on All</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={formData.discount_on_all}
                                            onChange={(e) => setFormData(prev => ({ ...prev, discount_on_all: Number(e.target.value) }))}
                                            className="h-11 bg-white/10 border-white/10 rounded-xl focus:ring-white/20 text-white font-bold"
                                        />
                                        <Select
                                            value={formData.discount_type}
                                            onValueChange={(v: any) => setFormData(prev => ({ ...prev, discount_type: v }))}
                                        >
                                            <SelectTrigger className="h-11 w-24 bg-white/10 border-white/10 rounded-xl text-white font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-zinc-100 dark:border-zinc-800">
                                                <SelectItem value="Percentage" className="rounded-lg">%</SelectItem>
                                                <SelectItem value="Fixed" className="rounded-lg">$</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Paid Amount</Label>
                                    <Input
                                        type="number"
                                        value={formData.paid_amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paid_amount: Number(e.target.value) }))}
                                        className={cn(
                                            "h-14 bg-white/20 border-white/20 rounded-2xl focus:ring-white/40 text-white font-black transition-all duration-300 px-4",
                                            getDynamicFontSize(formData.paid_amount.toString(), 'paidAmount')
                                        )}
                                    />
                                </div>

                                <div className="p-6 rounded-3xl bg-black/10 backdrop-blur-md space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic">Balance Due</span>
                                        <span className={cn(
                                            "font-black px-4 py-1 rounded-full transition-all duration-300 whitespace-nowrap",
                                            getDynamicFontSize(`$ ${Number(totals.balance).toFixed(2)}`, 'balanceDue'),
                                            totals.balance > 0 ? "bg-red-500/20 text-red-200" : "bg-emerald-500/20 text-emerald-200"
                                        )}>
                                            $ {Number(totals.balance).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 italic">
                                        <Edit2 size={14} className="opacity-50" />
                                        Editing: {sale?.sales_code || `#${saleId}`}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
