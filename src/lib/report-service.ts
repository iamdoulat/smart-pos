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
    }
};
