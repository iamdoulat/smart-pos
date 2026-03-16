import api from './axios';

export interface SaleItem {
    product_id: number;
    name?: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    tax_id?: number | null;
    tax_amount: number;
    total_amount: number;
}

export interface Sale {
    id?: number;
    company_id: number;
    customer_id: number;
    customer_email?: string;
    customer_mobile?: string;
    customer?: any;
    warehouse_id: number;
    sales_code: string;
    sales_date: string;
    due_date?: string;
    reference_no?: string;
    subtotal: number;
    other_charges?: number;
    discount_coupon_code?: string;
    coupon_discount?: number;
    discount_on_all?: number;
    discount_type: 'Percentage' | 'Fixed';
    round_off?: number;
    grand_total: number;
    paid_amount?: number;
    balance_amount?: number;
    note?: string;
    terms_and_conditions?: string;
    status: 'Final' | 'Quotation' | 'Proforma' | 'Refunded';
    payment_status?: 'Paid' | 'Partial' | 'Unpaid' | 'Refunded';
    account_id?: number;
    payment_type?: string;
    payment_note?: string;
    items: SaleItem[];
    payments?: any[];
}

export const SaleService = {
    async getAll(companyId: number): Promise<Sale[]> {
        const response = await api.get(`/sales?company_id=${companyId}`);
        return response.data;
    },
    async create(data: Partial<Sale>): Promise<Sale> {
        const response = await api.post('/sales', data);
        return response.data;
    },
    async getById(id: number): Promise<Sale> {
        const response = await api.get(`/sales/${id}`);
        return response.data;
    },
    async update(id: number, data: Partial<Sale>): Promise<Sale> {
        const response = await api.put(`/sales/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/sales/${id}`);
    },
    async markAsPaid(id: number): Promise<Sale> {
        const response = await api.post(`/sales/${id}/mark-as-paid`);
        return response.data;
    },
    async downloadPdf(id: number, salesCode: string): Promise<void> {
        try {
            const response = await api.get(`/sales/${id}/download-pdf`, {
                responseType: 'blob'
            });

            // Check if the response is actually a PDF
            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const error = JSON.parse(text);
                throw new Error(error.message || "Failed to generate PDF");
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${salesCode}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("PDF Download Error:", error);
            throw error;
        }
    },
    async sendEmail(id: number, email?: string): Promise<void> {
        await api.post(`/sales/${id}/send-email`, { email });
    },
    async refund(id: number): Promise<Sale> {
        const response = await api.post(`/sales/${id}/refund`);
        return response.data;
    }
};

export const PurchaseService = {
    async getAll(companyId: number) {
        const response = await api.get(`/purchases?company_id=${companyId}`);
        return response.data;
    },
    async create(data: any) {
        const response = await api.post('/purchases', data);
        return response.data;
    }
};
