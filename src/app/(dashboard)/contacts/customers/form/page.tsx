"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContactService, Contact } from "@/lib/contact-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    PlusSquare,
    Loader2,
    CheckCircle2,
    MapPin,
    ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2 } from "lucide-react";
import Link from "next/link";

function CustomerFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get('id');
    const { currentCompany } = useAuthStore();

    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(!!idParam);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("add-edit");
    const formRef = useRef<HTMLFormElement>(null);

    const handleCopyAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formRef.current) return;
        const form = formRef.current;
        if (e.target.checked) {
            (form.elements.namedItem("shipping_country") as HTMLInputElement).value = (form.elements.namedItem("country") as HTMLInputElement).value;
            (form.elements.namedItem("shipping_city") as HTMLInputElement).value = (form.elements.namedItem("city") as HTMLInputElement).value;
            (form.elements.namedItem("shipping_state") as HTMLInputElement).value = (form.elements.namedItem("state") as HTMLInputElement).value;
            (form.elements.namedItem("shipping_postcode") as HTMLInputElement).value = (form.elements.namedItem("postcode") as HTMLInputElement).value;
            (form.elements.namedItem("shipping_location_link") as HTMLInputElement).value = (form.elements.namedItem("location_link") as HTMLInputElement).value;
            (form.elements.namedItem("shipping_address") as HTMLTextAreaElement).value = (form.elements.namedItem("address") as HTMLTextAreaElement).value;
        }
    };

    useEffect(() => {
        const loadContact = async () => {
            if (!idParam) return;
            try {
                const data = await ContactService.getById(Number(idParam));
                setEditingContact(data);
            } catch (error) {
                toast.error("Failed to load customer details");
                router.push('/contacts/customers');
            } finally {
                setLoading(false);
            }
        };
        loadContact();
    }, [idParam, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentCompany) return;

        setSubmitting(true);
        const formElement = e.currentTarget;
        const formDataPayload = new FormData(formElement);

        formDataPayload.append('company_id', currentCompany.id.toString());
        formDataPayload.append('type', 'customer');

        // Clean empty file inputs
        const fileInput = formDataPayload.get('attachment') as File;
        if (fileInput && fileInput.size === 0) {
            formDataPayload.delete('attachment');
        }

        try {
            if (editingContact) {
                await ContactService.update(editingContact.id, formDataPayload);
                toast.success("Customer updated successfully");
            } else {
                await ContactService.create(formDataPayload);
                toast.success("Customer added successfully");
            }
            router.push('/contacts/customers');
        } catch (error) {
            toast.error("Failed to save customer");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-700 pb-20 px-8 py-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/contacts/customers">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                    <PlusSquare size={24} />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 bg-clip-text text-transparent tracking-tighter uppercase leading-none">
                        {editingContact ? "Edit Customer" : "Add Customer"}
                    </h2>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                        Enter customer information and billing details.
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <form ref={formRef} onSubmit={handleSubmit} className="p-0">
                    <Tabs defaultValue="add-edit" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-8 pt-6 border-b border-zinc-100 dark:border-zinc-800">
                            <TabsList className="bg-transparent h-auto p-0 gap-6">
                                <TabsTrigger
                                    value="add-edit"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent hover:bg-transparent px-2 py-3 text-sm font-bold uppercase tracking-wider text-zinc-500"
                                >
                                    <Edit2 size={14} className="mr-2 text-red-500" /> Add/Edit
                                </TabsTrigger>
                                <TabsTrigger
                                    value="advanced"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent hover:bg-transparent px-2 py-3 text-sm font-bold uppercase tracking-wider text-zinc-500"
                                >
                                    <Loader2 size={14} className="mr-2 text-red-500" /> Advanced
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="add-edit" className="p-8 mt-0 space-y-8 outline-none">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
                                {/* Column 1: Primary Info */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Customer Name*</Label>
                                        <Input name="name" defaultValue={editingContact?.name} required className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Email</Label>
                                        <Input name="email" type="email" defaultValue={editingContact?.email} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Mobile</Label>
                                        <Input name="mobile" defaultValue={editingContact?.mobile} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Phone</Label>
                                        <Input name="phone" defaultValue={editingContact?.phone} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                    </div>
                                </div>

                                {/* Column 2: Tax & Limits */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 items-start gap-4">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right mt-3">GST Number</Label>
                                        <div className="col-span-2">
                                            <Input name="gst_number" defaultValue={editingContact?.gst_number} className="h-10 rounded-xl border-zinc-200" />
                                            <div className="text-right mt-1"><a href="#" className="text-[10px] text-blue-500 hover:underline">Verify</a></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">TAX Number</Label>
                                        <Input name="tax_id" defaultValue={editingContact?.tax_id} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                    </div>
                                    <div className="grid grid-cols-3 items-start gap-4">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right mt-3">Credit Limit</Label>
                                        <div className="col-span-2">
                                            <Input name="credit_limit" type="number" step="0.01" defaultValue={editingContact?.credit_limit !== undefined ? editingContact.credit_limit : -1} className="h-10 rounded-xl border-zinc-200" />
                                            <p className="text-[10px] text-zinc-500 mt-1">-1 for No Limit</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 items-start gap-4">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right mt-3">Attachment</Label>
                                        <div className="col-span-2 space-y-1">
                                            <Input name="attachment" type="file" className="text-xs h-10 rounded-xl border-zinc-200 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200" />
                                            <p className="text-[10px] text-red-500">Size: 2MB</p>
                                            {editingContact?.attachment && (
                                                <a href={`${process.env.NEXT_PUBLIC_APP_URL}/storage/${editingContact.attachment}`} target="_blank" className="inline-block text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">Click to view</a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Column 3: Balances */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Opening Balance</Label>
                                        <Input name="opening_balance" type="number" step="0.01" defaultValue={editingContact?.opening_balance || 0} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Previous Due</Label>
                                        <Input name="previous_due" type="number" step="0.01" defaultValue={editingContact?.previous_due || 0} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <h4 className="flex items-center gap-2 text-green-700 font-bold uppercase tracking-wider text-sm border-b border-green-700/20 pb-2">
                                    <MapPin size={16} /> Address Details
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Country</Label>
                                            <Input name="country" defaultValue={editingContact?.country} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">City</Label>
                                            <Input name="city" defaultValue={editingContact?.city} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">State</Label>
                                            <Input name="state" defaultValue={editingContact?.state} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Postcode</Label>
                                            <Input name="postcode" defaultValue={editingContact?.postcode} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Location Link</Label>
                                            <Input name="location_link" defaultValue={editingContact?.location_link} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                        </div>
                                        <div className="grid grid-cols-3 items-start gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right mt-3">Address</Label>
                                            <textarea name="address" defaultValue={editingContact?.address} className="col-span-2 min-h-[60px] rounded-xl border border-zinc-200 p-2 text-sm max-h-32 resize-y" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <h4 className="flex items-center gap-2 text-green-700 font-bold uppercase tracking-wider text-sm border-b border-green-700/20 pb-2">
                                    <MapPin size={16} /> Shipping Address
                                </h4>
                                <div className="flex items-center gap-2 mb-4">
                                    <Label className="text-xs font-bold text-zinc-600 ml-8">Copy Address ?</Label>
                                    <input type="checkbox" onChange={handleCopyAddress} className="rounded border-zinc-300 h-4 w-4" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Country</Label>
                                            <Input name="shipping_country" defaultValue={editingContact?.shipping_country} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">City</Label>
                                            <Input name="shipping_city" defaultValue={editingContact?.shipping_city} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">State</Label>
                                            <Input name="shipping_state" defaultValue={editingContact?.shipping_state} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Postcode</Label>
                                            <Input name="shipping_postcode" defaultValue={editingContact?.shipping_postcode} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Location Link</Label>
                                            <Input name="shipping_location_link" defaultValue={editingContact?.shipping_location_link} className="col-span-2 h-10 rounded-xl border-zinc-200" />
                                        </div>
                                        <div className="grid grid-cols-3 items-start gap-4">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right mt-3">Address</Label>
                                            <textarea name="shipping_address" defaultValue={editingContact?.shipping_address} className="col-span-2 min-h-[60px] rounded-xl border border-zinc-200 p-2 text-sm max-h-32 resize-y" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="p-8 mt-0 min-h-[300px] outline-none">
                            <div className="grid grid-cols-1 gap-6 max-w-md">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Price Level Type</Label>
                                    <select name="price_level_type" defaultValue={editingContact?.price_level_type || "Increase"} className="col-span-2 h-10 rounded-xl border border-zinc-200 px-3 text-sm bg-white">
                                        <option value="Increase">Increase</option>
                                        <option value="Decrease">Decrease</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest text-right">Price Level</Label>
                                    <div className="col-span-2 flex items-center">
                                        <Input name="price_level" type="number" step="0.01" defaultValue={editingContact?.price_level || 0} className="w-full h-10 rounded-r-none rounded-l-md border-zinc-200" />
                                        <div className="h-10 px-4 bg-zinc-50 border border-l-0 border-zinc-200 rounded-r-md flex items-center justify-center font-bold text-blue-600">%</div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <div className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-6 flex justify-center gap-4">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white min-w-[120px] rounded-xl shadow"
                            >
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save
                            </Button>
                            <Link href="/contacts/customers">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="bg-orange-500 hover:bg-orange-600 hover:text-white border-0 text-white min-w-[120px] rounded-xl shadow"
                                >
                                    Close
                                </Button>
                            </Link>
                        </div>
                    </Tabs>
                </form>
            </div>
        </div>
    );
}

export default function CustomerFormPage() {
    return (
        <Suspense fallback={<div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
            <CustomerFormContent />
        </Suspense>
    );
}
