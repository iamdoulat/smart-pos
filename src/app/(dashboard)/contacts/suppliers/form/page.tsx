"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContactService, Contact } from "@/lib/contact-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Truck, ArrowLeft, MapPin, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function SupplierFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { currentCompany } = useAuthStore();

    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [contact, setContact] = useState<Contact | null>(null);
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

    const contactId = searchParams.get('id');

    useEffect(() => {
        const loadContact = async () => {
            if (!contactId) {
                setLoading(false);
                return;
            }
            try {
                const data = await ContactService.getById(Number(contactId));
                setContact(data);
            } catch (error) {
                toast.error("Failed to load supplier details");
                router.push("/contacts/suppliers");
            } finally {
                setLoading(false);
            }
        };

        if (currentCompany) {
            loadContact();
        }
    }, [contactId, currentCompany, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentCompany) return;

        setSubmitting(true);
        const formElement = e.currentTarget;
        const formDataPayload = new FormData(formElement);

        formDataPayload.append('company_id', currentCompany.id.toString());
        formDataPayload.append('type', 'vendor');

        // Clean empty file inputs
        const fileInput = formDataPayload.get('attachment') as File;
        if (fileInput && fileInput.size === 0) {
            formDataPayload.delete('attachment');
        }

        // Clean empty number inputs to avoid backend validation errors
        ['credit_limit', 'opening_balance', 'previous_due', 'price_level'].forEach(field => {
            const val = formDataPayload.get(field);
            if (val === '') formDataPayload.delete(field);
        });

        try {
            if (contactId) {
                await ContactService.update(Number(contactId), formDataPayload);
                toast.success("Supplier updated successfully");
            } else {
                await ContactService.create(formDataPayload);
                toast.success("Supplier added successfully");
            }
            router.push("/contacts/suppliers");
        } catch (error: any) {
            console.error("Save error: ", error);
            const msg = error.response?.data?.message || "Failed to save supplier";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20 px-8 py-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/contacts/suppliers')}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-zinc-600 dark:text-zinc-400" />
                </Button>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform -rotate-3 transition-transform hover:rotate-0">
                        <Truck size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-3xl font-black bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tighter uppercase pr-4 leading-tight mb-1">
                            {contactId ? 'Edit Supplier' : 'New Supplier'}
                        </h2>
                        <p className="text-[10px] md:text-sm text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                            {contactId ? 'Update existing supplier information' : 'Create a new supplier profile'}
                        </p>
                    </div>
                </div>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xl overflow-hidden rounded-xl">
                <CardContent className="p-0">
                    <form ref={formRef} onSubmit={handleSubmit} className="p-0">
                        <Tabs defaultValue="add-edit" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="px-8 pt-6 border-b border-zinc-100 dark:border-zinc-800">
                                <TabsList className="bg-transparent h-auto p-0 gap-6">
                                    <TabsTrigger
                                        value="add-edit"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:text-purple-600 data-[state=active]:shadow-none bg-transparent hover:bg-transparent px-2 py-3 text-sm font-bold uppercase tracking-wider text-zinc-500"
                                    >
                                        <Edit2 size={14} className="mr-2 text-purple-500" /> Add/Edit
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="advanced"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:text-purple-600 data-[state=active]:shadow-none bg-transparent hover:bg-transparent px-2 py-3 text-sm font-bold uppercase tracking-wider text-zinc-500"
                                    >
                                        <Loader2 size={14} className="mr-2 text-purple-500" /> Advanced
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="add-edit" className="p-8 mt-0 space-y-8 outline-none">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                                    {/* Column 1 */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Supplier Name *</Label>
                                            <Input name="name" defaultValue={contact?.name} required className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" placeholder="Enter supplier name" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Email</Label>
                                            <Input name="email" type="email" defaultValue={contact?.email} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" placeholder="supplier@example.com" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="flex justify-between items-center text-[10px] font-black text-black dark:text-white uppercase tracking-widest">
                                                <span>GST Number</span>
                                                <a href="#" className="text-purple-500 hover:underline normal-case text-[10px]">Verify</a>
                                            </Label>
                                            <Input name="gst_number" defaultValue={contact?.gst_number} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" placeholder="Enter GST number" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="flex justify-between items-center text-[10px] font-black text-black dark:text-white uppercase tracking-widest">
                                                <span>Credit Limit</span>
                                                <span className="text-[10px] text-zinc-500 normal-case">-1 for No Limit</span>
                                            </Label>
                                            <Input name="credit_limit" type="number" step="0.01" defaultValue={contact?.credit_limit !== undefined ? contact.credit_limit : -1} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium font-mono" />
                                        </div>
                                    </div>

                                    {/* Column 2 */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Mobile</Label>
                                            <Input name="mobile" defaultValue={contact?.mobile} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" placeholder="+1..." />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Phone</Label>
                                            <Input name="phone" defaultValue={contact?.phone} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" placeholder="Office number" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">TAX Number</Label>
                                            <Input name="tax_id" defaultValue={contact?.tax_id} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" placeholder="Tax Identification Number" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="flex justify-between items-center text-[10px] font-black text-black dark:text-white uppercase tracking-widest">
                                                <span>Attachment</span>
                                                <span className="text-[10px] text-red-500 normal-case">Max 2MB</span>
                                            </Label>
                                            <div className="space-y-2">
                                                <Input name="attachment" type="file" className="h-12 pt-2.5 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                                                {contact?.attachment && (
                                                    <a href={`${process.env.NEXT_PUBLIC_APP_URL}/storage/${contact.attachment}`} target="_blank" className="inline-block text-[10px] font-bold bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-full transition-colors">View Document</a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3 */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Opening Balance</Label>
                                            <Input name="opening_balance" type="number" step="0.01" defaultValue={contact?.opening_balance || 0} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium font-mono" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Previous Due</Label>
                                            <Input name="previous_due" type="number" step="0.01" defaultValue={contact?.previous_due || 0} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium font-mono" />
                                        </div>
                                    </div>
                                </div>

                                {/* Addresses section */}
                                <div className="space-y-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Billing Address */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4">
                                                <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                                                    <MapPin size={16} />
                                                </div>
                                                <h4 className="text-purple-700 dark:text-purple-400 font-bold uppercase tracking-wider text-sm">
                                                    Address Details
                                                </h4>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Country</Label>
                                                    <Input name="country" defaultValue={contact?.country} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">State</Label>
                                                    <Input name="state" defaultValue={contact?.state} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">City</Label>
                                                    <Input name="city" defaultValue={contact?.city} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Postcode</Label>
                                                    <Input name="postcode" defaultValue={contact?.postcode} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Address Line</Label>
                                                <textarea name="address" defaultValue={contact?.address} className="w-full min-h-[100px] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-sm bg-zinc-50 dark:bg-zinc-900/50 font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-y" placeholder="Full street address..." />
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Location Link (Map)</Label>
                                                <Input name="location_link" defaultValue={contact?.location_link} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" placeholder="https://maps.google.com/..." />
                                            </div>
                                        </div>

                                        {/* Shipping Address */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                                                        <Truck size={16} />
                                                    </div>
                                                    <h4 className="text-orange-700 dark:text-orange-400 font-bold uppercase tracking-wider text-sm">
                                                        Shipping Address
                                                    </h4>
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest group-hover:text-zinc-700 transition-colors">Copy Billing</span>
                                                    <div className="relative flex items-center justify-center">
                                                        <input type="checkbox" onChange={handleCopyAddress} className="peer appearance-none w-5 h-5 border-2 border-zinc-300 rounded-md checked:bg-orange-500 checked:border-orange-500 transition-colors outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-1" />
                                                        <Loader2 className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 w-3 h-3" /> {/* Check icon visually */}
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Country</Label>
                                                    <Input name="shipping_country" defaultValue={contact?.shipping_country} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-orange-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">State</Label>
                                                    <Input name="shipping_state" defaultValue={contact?.shipping_state} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-orange-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">City</Label>
                                                    <Input name="shipping_city" defaultValue={contact?.shipping_city} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-orange-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Postcode</Label>
                                                    <Input name="shipping_postcode" defaultValue={contact?.shipping_postcode} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-orange-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Address Line</Label>
                                                <textarea name="shipping_address" defaultValue={contact?.shipping_address} className="w-full min-h-[100px] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-sm bg-zinc-50 dark:bg-zinc-900/50 font-medium focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-y" placeholder="Full street address..." />
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Location Link (Map)</Label>
                                                <Input name="shipping_location_link" defaultValue={contact?.shipping_location_link} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-orange-500 bg-zinc-50 dark:bg-zinc-900/50 transition-all font-medium" placeholder="https://maps.google.com/..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="advanced" className="p-8 mt-0 outline-none min-h-[400px]">
                                <div className="max-w-md w-full p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 space-y-6">
                                    <h4 className="font-black text-xl tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                                            <Edit2 size={20} />
                                        </div>
                                        Pricing Settings
                                    </h4>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Price Level Type</Label>
                                        <select name="price_level_type" defaultValue={contact?.price_level_type || "Increase"} className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 text-sm bg-white dark:bg-zinc-900 font-medium focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm">
                                            <option value="Increase">Increase Price</option>
                                            <option value="Decrease">Decrease Price (Discount)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">Price Level (%)</Label>
                                        <div className="relative">
                                            <Input name="price_level" type="number" step="0.01" defaultValue={contact?.price_level || 0} className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 focus:ring-purple-500 bg-white dark:bg-zinc-900 pl-12 transition-all font-medium text-lg font-mono shadow-sm" />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-purple-500 text-lg">%</div>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-medium mt-1">This percentage will be applied automatically to all catalog items for this supplier.</p>
                                    </div>
                                </div>
                            </TabsContent>

                            <div className="bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 p-6 flex justify-end gap-4 rounded-b-xl">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/contacts/suppliers')}
                                    className="h-12 bg-white dark:bg-zinc-900 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-8 rounded-xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-12 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 text-white px-10 rounded-xl font-black uppercase tracking-tighter shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 border-0"
                                >
                                    {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                    {contactId ? 'Save Changes' : 'Create Supplier'}
                                </Button>
                            </div>
                        </Tabs>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function SupplierFormPage() {
    return (
        <Suspense fallback={<div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>}>
            <SupplierFormContent />
        </Suspense>
    );
}
