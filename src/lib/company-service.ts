import api from './axios';

export interface Company {
    id: number;
    user_id: number;
    name: string;
    address?: string;
    legal_identity?: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    tax_id?: string;
    timezone?: string;
    currency: string;
    fiscal_year_start?: string;
    logo_path?: string;
    logo_url?: string;
    favicon_path?: string;
    favicon_url?: string;
    qr_code_path?: string;
    qr_code_url?: string;
    pos_email?: string;
    pos_website?: string;
    pos_mobile?: string;

    // PWA Settings
    app_name?: string;
    app_short_name?: string;
    app_description?: string;
    pwa_icon_144?: string;
    pwa_icon_144_url?: string;
    pwa_icon_192?: string;
    pwa_icon_192_url?: string;
    pwa_icon_512?: string;
    pwa_icon_512_url?: string;
    pwa_maskable_icon?: string;
    pwa_maskable_icon_url?: string;
    pwa_screenshot?: string;
    pwa_screenshot_url?: string;

    created_at?: string;
    updated_at?: string;
}

export const CompanyService = {
    async getAll(): Promise<Company[]> {
        const response = await api.get('/companies');
        return response.data;
    },

    async getById(id: number): Promise<Company> {
        const response = await api.get(`/companies/${id}`);
        return response.data;
    },

    async update(id: number, formData: FormData): Promise<Company> {
        // We use POST with _method=PUT for multipart support in Laravel
        formData.append('_method', 'PUT');
        const response = await api.post(`/companies/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async create(formData: FormData): Promise<Company> {
        const response = await api.post('/companies', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/companies/${id}`);
    }
};
