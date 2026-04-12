import api from './axios';

export const ReportService = {
    async getSummary(companyId: number) {
        const response = await api.get(`/reports/summary?company_id=${companyId}`);
        return response.data;
    },

    exportExcelUrl(companyId: number) {
        return `${process.env.NEXT_PUBLIC_API_URL}/reports/export-excel?company_id=${companyId}`;
    },

    exportPdfUrl(companyId: number) {
        return `${process.env.NEXT_PUBLIC_API_URL}/reports/export-pdf?company_id=${companyId}`;
    },

    exportSupplierPdfUrl(companyId: number, supplierId: number) {
        return `${process.env.NEXT_PUBLIC_API_URL}/reports/export-supplier-pdf?company_id=${companyId}&supplier_id=${supplierId}`;
    },

    exportYearlyPdfUrl(companyId: number, year: number) {
        return `${process.env.NEXT_PUBLIC_API_URL}/reports/export-yearly-pdf?company_id=${companyId}&year=${year}`;
    },

    exportExpensesPdfUrl(companyId: number, year: number) {
        return `${process.env.NEXT_PUBLIC_API_URL}/reports/export-expenses-pdf?company_id=${companyId}&year=${year}`;
    },

    exportBankPdfUrl(companyId: number, year: number) {
        return `${process.env.NEXT_PUBLIC_API_URL}/reports/export-bank-pdf?company_id=${companyId}&year=${year}`;
    }
};
