"use client";

import { useEffect, useState } from "react";
import { PurchaseService } from "@/lib/sales-purchase-service";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag, ArrowDownRight, Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const companyId = 1;

    useEffect(() => {
        async function loadPurchases() {
            try {
                const data = await PurchaseService.getAll(companyId);
                setPurchases(data);
            } catch (error) {
                console.error("Failed to load purchases", error);
            } finally {
                setLoading(false);
            }
        }
        loadPurchases();
    }, [companyId]);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Purchases & Bills</h2>
                    <p className="text-zinc-400">Manage your vendor bills and business expenses.</p>
                </div>
                <Link href="/purchases/new">
                    <Button className="bg-rose-600 hover:bg-rose-700">
                        <Plus className="mr-2 h-4 w-4" /> Record Bill
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard
                    title="Total Purchases"
                    value={`$${purchases.reduce((acc, p) => acc + parseFloat(p.amount), 0).toFixed(2)}`}
                    icon={ArrowDownRight}
                    color="text-rose-500"
                />
                <SummaryCard
                    title="Bills Recorded"
                    value={purchases.length.toString()}
                    icon={ShoppingBag}
                    color="text-indigo-500"
                />
                <SummaryCard
                    title="Avg. Bill Amount"
                    value={`$${(purchases.length > 0 ? purchases.reduce((acc, p) => acc + parseFloat(p.amount), 0) / purchases.length : 0).toFixed(2)}`}
                    icon={FileText}
                    color="text-amber-500"
                />
            </div>

            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="border-zinc-800">
                            <TableRow className="hover:bg-transparent border-zinc-800">
                                <TableHead className="text-zinc-400">Bill #</TableHead>
                                <TableHead className="text-zinc-400">Vendor</TableHead>
                                <TableHead className="text-zinc-400">Category</TableHead>
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400 text-right">Amount</TableHead>
                                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchases.map((purchase) => (
                                <TableRow key={purchase.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                                    <TableCell className="font-medium text-zinc-100">
                                        BIL-{purchase.id.toString().padStart(4, '0')}
                                    </TableCell>
                                    <TableCell className="text-zinc-300">{purchase.contact?.name || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                            {purchase.category?.name || "General Expense"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">
                                        {new Date(purchase.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right text-rose-500 font-bold">
                                        ${parseFloat(purchase.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                                            <FileText size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {purchases.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                                        No purchase records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function SummaryCard({ title, value, icon: Icon, color }: any) {
    return (
        <Card className="border-zinc-800 bg-zinc-900/50">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-zinc-500">{title}</p>
                        <h3 className="text-2xl font-bold text-zinc-100 mt-1">{value}</h3>
                    </div>
                    <div className={cn("p-2 rounded-lg bg-zinc-800", color)}>
                        <Icon size={20} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
