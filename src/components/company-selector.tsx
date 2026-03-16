"use client";

import { useEffect, useState } from "react";
import { CompanyService } from "@/lib/company-service";
import { useAuthStore } from "@/lib/store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

export function CompanySelector() {
    const { currentCompany, setCurrentCompany } = useAuthStore();
    const [companies, setCompanies] = useState<any[]>([]);

    useEffect(() => {
        let isMounted = true;
        async function loadCompanies() {
            try {
                const data = await CompanyService.getAll();
                if (!isMounted) return;
                setCompanies(data);

                const currentState = useAuthStore.getState();
                if (data.length > 0 && !currentState.currentCompany) {
                    setCurrentCompany(data[0]);
                }
            } catch (error) {
                console.error("Failed to load companies", error);
            }
        }
        loadCompanies();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="flex items-center gap-2">
            <Select
                value={currentCompany?.id?.toString()}
                onValueChange={(val) => {
                    const company = companies.find((c) => c.id.toString() === val);
                    setCurrentCompany(company);
                }}
            >
                <SelectTrigger className="w-[200px] bg-zinc-900 border-zinc-800 text-zinc-100">
                    <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-zinc-400" />
                        <SelectValue placeholder="Select Company" />
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
