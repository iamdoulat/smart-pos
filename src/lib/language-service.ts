import api from './axios';

export interface Language {
    id: number;
    user_id: number;
    name: string;
    code: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export const LanguageService = {
    async getLanguages(): Promise<Language[]> {
        const response = await api.get('/languages');
        return response.data;
    },

    async getLanguage(id: number): Promise<Language> {
        const response = await api.get(`/languages/${id}`);
        return response.data;
    },

    async createLanguage(data: Partial<Language>): Promise<Language> {
        const response = await api.post('/languages', data);
        return response.data;
    },

    async updateLanguage(id: number, data: Partial<Language>): Promise<Language> {
        const response = await api.put(`/languages/${id}`, data);
        return response.data;
    },

    async deleteLanguage(id: number): Promise<void> {
        await api.delete(`/languages/${id}`);
    }
};
