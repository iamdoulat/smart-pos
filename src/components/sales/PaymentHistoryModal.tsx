"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, CreditCard, User, X } from "lucide-react";
import { Sale } from "@/lib/sales-purchase-service";
import { useTranslation } from "@/i18n/TranslationContext";

interface PaymentHistoryModalProps {
    sale: Sale | null;
    open: boolean;
    onClose: () => void;
}

export function PaymentHistoryModal({ sale, open, onClose }: PaymentHistoryModalProps) {
    const { t } = useTranslation();

    if (!sale) return null;

    const payments = (sale as any).payments || [];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl border-0 bg-white dark:bg-zinc-900 shadow-2xl rounded-[32px] p-0 overflow-hidden">
                <DialogHeader className="p-8 bg-indigo-600 text-white relative">
                    <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                        <Receipt size={28} />
                        {t('sales.payment_history') || "PAYMENT HISTORY"}
                    </DialogTitle>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">{(t('common.invoice') || "Invoice").toUpperCase()}: {sale.sales_code}</p>
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border-0 text-white"
                    >
                        <X size={20} />
                    </button>
                </DialogHeader>

                <div className="p-8">
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t('sales.grand_total') || "Grand Total"}</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">${Number(sale.grand_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t('sales.paid_amount') || "Paid Amount"}</p>
                            <p className="text-2xl font-black text-indigo-600">${Number(sale.paid_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <CreditCard size={14} /> {t('sales.recorded_payments') || "Recorded Payments"}
                        </h4>
                        <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                                    <TableRow className="hover:bg-transparent border-0">
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">{t('common.date') || "Date"}</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">{t('common.type') || "Type"}</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">{t('common.amount') || "Amount"}</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 h-10">{t('sales.table_account') || "Account"}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.length > 0 ? (
                                        payments.map((p: any) => (
                                            <TableRow key={p.id} className="border-zinc-50 dark:border-zinc-800 hover:bg-transparent transition-colors">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-2 font-bold text-zinc-600 dark:text-zinc-400">
                                                        <Calendar size={14} className="opacity-40" />
                                                        {new Date(p.date).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">{p.payment_type}</TableCell>
                                                <TableCell className="font-black text-indigo-600">${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-zinc-500">
                                                        <User size={14} className="opacity-40" />
                                                        <p className="text-zinc-100 font-bold">{p.account?.name || "CASH"}</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-sm font-bold text-zinc-400 italic">
                                                {t('sales.no_payments') || "No payments recorded yet."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <Badge className={cn(
                            "rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest border-0",
                            sale.payment_status === 'Paid' ? "bg-emerald-500 text-white" :
                                sale.payment_status === 'Partial' ? "bg-amber-500 text-white" :
                                    "bg-red-500 text-white"
                        )}>
                            {t('common.status') || "Status"}: {sale.payment_status}
                        </Badge>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
