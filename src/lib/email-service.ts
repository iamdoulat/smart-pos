import axios from "@/lib/axios";

export interface EmailConfiguration {
    id: number;
    name: string;
    provider: 'smtp' | 'resend';
    from_name: string | null;
    from_address: string | null;
    host: string | null;
    port: number | null;
    username: string | null;
    password?: string;
    daily_limit: number | null;
    daily_usage: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export const EmailService = {
    getConfigurations: async (): Promise<EmailConfiguration[]> => {
        const response = await axios.get("/email-configurations");
        return response.data;
    },

    createConfiguration: async (data: Partial<EmailConfiguration>): Promise<EmailConfiguration> => {
        const response = await axios.post("/email-configurations", data);
        return response.data;
    },

    updateConfiguration: async (id: number, data: Partial<EmailConfiguration>): Promise<EmailConfiguration> => {
        const response = await axios.put(`/email-configurations/${id}`, data);
        return response.data;
    },

    deleteConfiguration: async (id: number): Promise<void> => {
        await axios.delete(`/email-configurations/${id}`);
    },

    testConnection: async (id: number): Promise<{ success: boolean; message: string }> => {
        const response = await axios.post(`/email-configurations/${id}/test-connection`);
        return response.data;
    },

    sendTestEmail: async (id: number, email: string): Promise<{ success: boolean; message: string }> => {
        const response = await axios.post(`/email-configurations/${id}/send-test-email`, { email });
        return response.data;
    },

    sendInvoiceEmail: async (config_id: number, recipient: string, invoiceDetails: {
        sales_code: string;
        customer_name: string;
        grand_total: number;
        paid_amount: number;
        balance_due: number;
        sales_date: string;
        company_name: string;
        items?: { name: string; quantity: number; unit_price: number; total_amount: number }[];
    }): Promise<{ success: boolean; message: string }> => {
        // Build a simple HTML email body
        const itemRows = (invoiceDetails.items || []).map(item =>
            `<tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px 12px;">${item.name}</td>
                <td style="padding:8px 12px;text-align:center;">${item.quantity}</td>
                <td style="padding:8px 12px;text-align:right;">$${Number(item.unit_price).toFixed(2)}</td>
                <td style="padding:8px 12px;text-align:right;">$${Number(item.total_amount).toFixed(2)}</td>
            </tr>`
        ).join('');

        const html = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;color:white;">
                    <h1 style="margin:0;font-size:24px;">Invoice Notification</h1>
                    <p style="margin:8px 0 0;opacity:0.8;">${invoiceDetails.company_name}</p>
                </div>
                <div style="padding:32px;">
                    <p style="color:#374151;">Dear <strong>${invoiceDetails.customer_name}</strong>,</p>
                    <p style="color:#6b7280;">Please find your invoice details below.</p>
                    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;">
                        <table style="width:100%;border-collapse:collapse;font-size:14px;">
                            <tr><td style="color:#6b7280;padding:4px 0;">Invoice #</td><td style="font-weight:bold;text-align:right;">${invoiceDetails.sales_code}</td></tr>
                            <tr><td style="color:#6b7280;padding:4px 0;">Date</td><td style="font-weight:bold;text-align:right;">${invoiceDetails.sales_date}</td></tr>
                            <tr><td style="color:#6b7280;padding:4px 0;">Grand Total</td><td style="font-weight:bold;text-align:right;">$${Number(invoiceDetails.grand_total).toFixed(2)}</td></tr>
                            <tr><td style="color:#6b7280;padding:4px 0;">Paid Amount</td><td style="color:#10b981;font-weight:bold;text-align:right;">$${Number(invoiceDetails.paid_amount).toFixed(2)}</td></tr>
                            <tr><td style="color:#6b7280;padding:4px 0;">Balance Due</td><td style="color:${invoiceDetails.balance_due > 0 ? '#ef4444' : '#10b981'};font-weight:bold;text-align:right;">$${Number(invoiceDetails.balance_due).toFixed(2)}</td></tr>
                        </table>
                    </div>
                    ${itemRows ? `<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:16px;">
                        <thead><tr style="background:#f3f4f6;"><th style="padding:8px 12px;text-align:left;">Item</th><th style="padding:8px 12px;text-align:center;">Qty</th><th style="padding:8px 12px;text-align:right;">Price</th><th style="padding:8px 12px;text-align:right;">Total</th></tr></thead>
                        <tbody>${itemRows}</tbody>
                    </table>` : ''}
                    <p style="color:#6b7280;font-size:13px;margin-top:24px;">Thank you for your business!</p>
                </div>
            </div>`;

        const response = await axios.post(`/email-configurations/${config_id}/send-test-email`, {
            email: recipient,
            subject: `Invoice ${invoiceDetails.sales_code} from ${invoiceDetails.company_name}`,
            html
        });
        return response.data;
    }
};
