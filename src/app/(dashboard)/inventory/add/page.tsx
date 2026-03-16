"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductService } from "@/lib/product-service";
import { CategoryService } from "@/lib/category-service";
import { BrandService } from "@/lib/brand-service";
import { VariantService } from "@/lib/variant-service";
import { WarehouseService } from "@/lib/warehouse-service";
import { TaxService } from "@/lib/tax-bank-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Package,
    ArrowLeft,
    Check,
    Loader2,
    Plus,
    Info,
    Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/* ─── Types ────────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
    // Basic Info
    item_code: "",
    name: "",
    item_group: "Single",
    brand_id: "",
    category_id: "",
    variant_id: "",
    unit: "",
    sku: "",
    hsn: "",
    barcode: "",
    alert_quantity: "0",
    seller_points: "0",
    description: "",
    image: null as File | null,

    // Pricing
    discount_type: "Percentage(%)",
    discount: "0",
    price_before_tax: "",
    tax_id: "NONE",
    tax_type: "Exclusive",
    purchase_price: "",
    profit_margin_percent: "0",
    sales_price: "",
    mrp: "",

    // Stock
    warehouse_id: "",
    stock_quantity: "0",
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AddProductPage() {
    const { currentCompany } = useAuthStore();
    const router = useRouter();

    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [taxes, setTaxes] = useState<any[]>([]);

    useEffect(() => {
        if (currentCompany) {
            CategoryService.getAll(currentCompany.id).then(setCategories).catch(() => { });
            BrandService.getAll(currentCompany.id).then(setBrands).catch(() => { });
            VariantService.getAll(currentCompany.id).then(setVariants).catch(() => { });
            TaxService.getAll(currentCompany.id).then(setTaxes).catch(() => { });
            WarehouseService.getAll(currentCompany.id).then((data) => {
                setWarehouses(data);
                if (data.length > 0) {
                    const mainWH = data.find((w: any) => w.name.toLowerCase().includes('main'));
                    setForm(prev => ({ ...prev, warehouse_id: (mainWH?.id || data[0].id).toString() }));
                }
            }).catch(() => { });
        }
    }, [currentCompany]);

    const calculatePurchasePrice = (price: string, taxId: string, taxType: string) => {
        const p = parseFloat(price) || 0;
        if (!taxId || taxId === "NONE") return p.toFixed(2);
        const tax = taxes.find(t => t.id.toString() === taxId);
        if (!tax) return p.toFixed(2);

        const rate = parseFloat(tax.rate) || 0;
        if (taxType === "Exclusive") {
            return (p * (1 + rate / 100)).toFixed(2);
        }
        return p.toFixed(2);
    };

    const calculateSalesPrice = (purchasePrice: string, margin: string) => {
        const pp = parseFloat(purchasePrice) || 0;
        const m = parseFloat(margin) || 0;
        return (pp * (1 + m / 100)).toFixed(2);
    };

    const calculateMargin = (purchasePrice: string, salesPrice: string) => {
        const pp = parseFloat(purchasePrice) || 0;
        const sp = parseFloat(salesPrice) || 0;
        if (pp === 0) return "0";
        return (((sp - pp) / pp) * 100).toFixed(2);
    };

    const handlePriceChange = (price: string) => {
        const pp = calculatePurchasePrice(price, form.tax_id, form.tax_type);
        const sp = calculateSalesPrice(pp, form.profit_margin_percent);
        setForm({ ...form, price_before_tax: price, purchase_price: pp, sales_price: sp });
    };

    const handleTaxChange = (taxId: string) => {
        const pp = calculatePurchasePrice(form.price_before_tax, taxId, form.tax_type);
        const sp = calculateSalesPrice(pp, form.profit_margin_percent);
        setForm({ ...form, tax_id: taxId, purchase_price: pp, sales_price: sp });
    };

    const handleTaxTypeChange = (taxType: string) => {
        const pp = calculatePurchasePrice(form.price_before_tax, form.tax_id, taxType);
        const sp = calculateSalesPrice(pp, form.profit_margin_percent);
        setForm({ ...form, tax_type: taxType, purchase_price: pp, sales_price: sp });
    };

    const handleMarginChange = (margin: string) => {
        const sp = calculateSalesPrice(form.purchase_price, margin);
        setForm({ ...form, profit_margin_percent: margin, sales_price: sp });
    };

    const handleSalesPriceChange = (sp: string) => {
        const margin = calculateMargin(form.purchase_price, sp);
        setForm({ ...form, sales_price: sp, profit_margin_percent: margin });
    };

    const handlePurchasePriceChange = (pp: string) => {
        // When purchase price is manually entered, we assume the user is overriding the cost logic.
        // We update the sales price based on the current margin.
        const sp = calculateSalesPrice(pp, form.profit_margin_percent);
        setForm({ ...form, purchase_price: pp, sales_price: sp });
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = "Item Name is required";
        if (!form.item_code.trim()) e.item_code = "Item Code is required";
        if (!form.category_id) e.category_id = "Category is required";
        if (!form.purchase_price || isNaN(Number(form.purchase_price))) e.purchase_price = "Required";
        if (!form.sales_price || isNaN(Number(form.sales_price))) e.sales_price = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate() || !currentCompany) return;
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('company_id', currentCompany.id.toString());
            formData.append('name', form.name);
            formData.append('item_code', form.item_code);
            formData.append('item_group', form.item_group);
            if (form.brand_id) formData.append('brand_id', form.brand_id);
            if (form.category_id) formData.append('category_id', form.category_id);
            if (form.variant_id) formData.append('variant_id', form.variant_id);
            formData.append('unit', form.unit);
            formData.append('sku', form.sku);
            formData.append('hsn', form.hsn);
            formData.append('barcode', form.barcode);
            formData.append('description', form.description);
            formData.append('purchase_price', form.purchase_price);
            formData.append('sales_price', form.sales_price);
            formData.append('price_before_tax', form.price_before_tax || "0");
            formData.append('tax_id', form.tax_id);
            formData.append('tax_type', form.tax_type);
            formData.append('profit_margin_percent', form.profit_margin_percent);
            formData.append('discount_type', form.discount_type);
            formData.append('discount', form.discount);
            formData.append('mrp', form.mrp || "0");
            formData.append('alert_quantity', form.alert_quantity);
            formData.append('low_stock_threshold', form.alert_quantity);
            formData.append('stock_quantity', form.stock_quantity);
            formData.append('seller_points', form.seller_points);
            formData.append('warehouse_id', form.warehouse_id);

            if (form.image) {
                formData.append('image', form.image);
            }

            await ProductService.create(formData);
            toast.success("Product created successfully");
            router.push("/inventory");
        } catch {
            toast.error("Failed to create product");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="px-4 md:px-8 pb-4 md:pb-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 transform rotate-3">
                            <Package size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tighter uppercase italic leading-none mb-1">
                                Add Product
                            </h2>
                            <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                                Complete all details to add a new item to your catalog.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Form Content ── */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-xl overflow-hidden relative">
                <div className="h-2 absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500" />

                <div className="p-8 md:p-10 space-y-10">
                    {/* Section 1: Item Details */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
                            General Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            <Field label="Item Code" required error={errors.item_code}>
                                <Input
                                    value={form.item_code}
                                    onChange={(e) => setForm({ ...form, item_code: e.target.value })}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent focus:border-purple-500/50"
                                />
                            </Field>
                            <Field label="Item Name" required error={errors.name}>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent focus:border-purple-500/50"
                                />
                            </Field>
                            <Field label="Item Group" required>
                                <Select value={form.item_group} onValueChange={(v) => setForm({ ...form, item_group: v })}>
                                    <SelectTrigger className="rounded-xl h-12 bg-zinc-50 border-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Single">Single</SelectItem>
                                        <SelectItem value="Variants">Variants</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Brand">
                                <div className="flex gap-2">
                                    <Select value={form.brand_id} onValueChange={(v) => setForm({ ...form, brand_id: v })}>
                                        <SelectTrigger className="flex-1 rounded-xl h-12 bg-zinc-50 border-transparent">
                                            <SelectValue placeholder="-Select-" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-zinc-200" onClick={() => router.push('/inventory/brands')}>
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            </Field>

                            {form.item_group === "Variants" && (
                                <Field label="Variant">
                                    <div className="flex gap-2 animate-in fade-in zoom-in duration-300">
                                        <Select value={form.variant_id} onValueChange={(v) => setForm({ ...form, variant_id: v })}>
                                            <SelectTrigger className="flex-1 rounded-xl h-12 bg-zinc-50 border-transparent">
                                                <SelectValue placeholder="-Select-" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {variants.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-zinc-200" onClick={() => router.push('/inventory/variants')}>
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                </Field>
                            )}
                            <Field label="Unit" required>
                                <div className="flex gap-2">
                                    <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                                        <SelectTrigger className="flex-1 rounded-xl h-12 bg-zinc-50 border-transparent">
                                            <SelectValue placeholder="-Select-" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pcs">Pcs</SelectItem>
                                            <SelectItem value="Kg">Kg</SelectItem>
                                            <SelectItem value="Ltr">Ltr</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-zinc-200">
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            </Field>
                            <Field label="SKU" hint="Optional">
                                <Input
                                    value={form.sku}
                                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent focus:border-purple-500/50 font-mono"
                                />
                            </Field>

                            <Field label="HSN">
                                <Input
                                    value={form.hsn}
                                    onChange={(e) => setForm({ ...form, hsn: e.target.value })}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent"
                                />
                            </Field>
                            <Field label="Alert Quantity">
                                <Input
                                    type="number"
                                    value={form.alert_quantity}
                                    onChange={(e) => setForm({ ...form, alert_quantity: e.target.value })}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent"
                                />
                            </Field>
                            <Field label="Seller Points">
                                <Input
                                    type="number"
                                    value={form.seller_points}
                                    onChange={(e) => setForm({ ...form, seller_points: e.target.value })}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent"
                                />
                            </Field>

                            <Field label="Barcode">
                                <Input
                                    value={form.barcode}
                                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent"
                                />
                            </Field>
                            <div className="md:col-span-1">
                                <Field label="Category" required error={errors.category_id}>
                                    <div className="flex gap-2">
                                        <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                                            <SelectTrigger className="flex-1 rounded-xl h-12 bg-zinc-50 border-transparent">
                                                <SelectValue placeholder="-Select-" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-zinc-200" onClick={() => router.push('/inventory/categories')}>
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                </Field>
                            </div>
                            <div className="md:col-span-1">
                                <Field label="Select Image">
                                    <input
                                        type="file"
                                        id="image-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setForm({ ...form, image: file });
                                        }}
                                    />
                                    <div
                                        onClick={() => document.getElementById('image-upload')?.click()}
                                        className={cn(
                                            "border-2 border-dashed rounded-xl h-12 flex items-center px-4 gap-3 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors",
                                            form.image ? "border-emerald-500/50 bg-emerald-50/10" : "border-zinc-200"
                                        )}
                                    >
                                        <ImageIcon size={18} className={form.image ? "text-emerald-500" : "text-zinc-400"} />
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-tighter truncate max-w-[200px]",
                                            form.image ? "text-emerald-600" : "text-zinc-500"
                                        )}>
                                            {form.image ? form.image.name : "Choose File"}
                                        </span>
                                        {form.image && <Check size={14} className="text-emerald-500 ml-auto" />}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mt-1 font-bold">Max Width/Height: 1000px * 1000px & Size: 2MB</p>
                                </Field>
                            </div>

                            <Field label="Warehouse">
                                <Select value={form.warehouse_id} onValueChange={(v) => setForm({ ...form, warehouse_id: v })}>
                                    <SelectTrigger className="rounded-xl h-12 bg-zinc-50 border-transparent">
                                        <SelectValue placeholder="-Select-" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Stock">
                                <Input
                                    type="number"
                                    value={form.stock_quantity}
                                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent font-bold"
                                />
                            </Field>
                        </div>

                        <Field label="Description">
                            <textarea
                                rows={2}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full rounded-2xl border-transparent bg-zinc-50 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                            />
                        </Field>
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                    {/* Section 2: Discount & Price */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-3">
                            <span className="h-px w-8 bg-zinc-200 dark:bg-zinc-800" />
                            Pricing & Discounts
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            <Field label="Discount Type">
                                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                                    <SelectTrigger className="rounded-xl h-12 bg-zinc-50 border-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Percentage(%)">Percentage(%)</SelectItem>
                                        <SelectItem value="Fixed">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="Discount">
                                <Input
                                    type="number"
                                    value={form.discount}
                                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent"
                                />
                            </Field>
                            <div className="hidden md:block" />

                            <Field label="Price*" required error={errors.price_before_tax}>
                                <Input
                                    placeholder="Price of Item without Tax"
                                    value={form.price_before_tax}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent"
                                />
                            </Field>
                            <Field label="Tax*">
                                <div className="flex gap-2">
                                    <Select value={form.tax_id} onValueChange={(v) => handleTaxChange(v)}>
                                        <SelectTrigger className="flex-1 rounded-xl h-12 bg-zinc-50 border-transparent">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NONE">NONE</SelectItem>
                                            {taxes.map(t => (
                                                <SelectItem key={t.id} value={t.id.toString()}>{t.name} ({t.rate}%)</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-zinc-200" onClick={() => router.push('/settings/taxes')}>
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            </Field>
                            <Field label="Purchase Price*" required>
                                <Input
                                    placeholder="Total Price with Tax Amount"
                                    value={form.purchase_price}
                                    onChange={(e) => handlePurchasePriceChange(e.target.value)}
                                    className="rounded-xl h-12 bg-zinc-100 border-transparent font-bold"
                                />
                            </Field>

                            <Field label="Tax Type*" required>
                                <Select value={form.tax_type} onValueChange={(v) => handleTaxTypeChange(v)}>
                                    <SelectTrigger className="rounded-xl h-12 bg-zinc-50 border-transparent">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Exclusive">Exclusive</SelectItem>
                                        <SelectItem value="Inclusive">Inclusive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="Profit Margin(%)" hint="Info icon here">
                                <div className="relative">
                                    <Input
                                        value={form.profit_margin_percent}
                                        onChange={(e) => handleMarginChange(e.target.value)}
                                        className="rounded-xl h-12 bg-zinc-50 border-transparent pr-10"
                                    />
                                    <Info size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500" />
                                </div>
                            </Field>
                            <Field label="Sales Price*">
                                <Input
                                    value={form.sales_price}
                                    onChange={(e) => handleSalesPriceChange(e.target.value)}
                                    className="rounded-xl h-12 bg-zinc-50 border-transparent text-emerald-600 font-black"
                                />
                            </Field>

                            <Field label="MRP">
                                <div className="relative">
                                    <Input
                                        placeholder="Maximum Retail Price"
                                        value={form.mrp}
                                        onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                                        className="rounded-xl h-12 bg-zinc-50 border-transparent pr-10"
                                    />
                                    <Info size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500" />
                                </div>
                            </Field>
                        </div>
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
                </div>

                {/* Footer */}
                <div className="bg-zinc-50 dark:bg-zinc-950/50 p-8 flex justify-center gap-4 border-t border-zinc-200">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-orange-500 via-purple-500 to-indigo-600 hover:scale-[1.02] active:scale-95 text-white rounded-full px-12 h-12 font-black uppercase italic tracking-tighter min-w-[160px] shadow-lg shadow-purple-500/25 border-0 transition-all"
                    >
                        {saving ? <Loader2 className="animate-spin h-5 w-5" /> : "Save"}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => router.back()}
                        className="bg-gradient-to-r from-rose-500 via-red-500 to-orange-600 hover:scale-[1.02] active:scale-95 text-white rounded-full px-12 h-12 font-black uppercase italic tracking-tighter min-w-[160px] shadow-lg shadow-rose-500/25 border-0 transition-all"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    required,
    hint,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                {label}
                {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
            {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{error}</p>}
        </div>
    );
}
