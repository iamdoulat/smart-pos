import axios from './axios';

export interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    exchange_rate: string | number;
    is_default: boolean;
    created_at?: string;
    updated_at?: string;
}

export const CurrencyService = {
    getCurrencies: async (): Promise<Currency[]> => {
        const response = await axios.get('/currencies');
        return response.data;
    },

    getCurrency: async (id: number): Promise<Currency> => {
        const response = await axios.get(`/currencies/${id}`);
        return response.data;
    },

    createCurrency: async (data: Partial<Currency>): Promise<Currency> => {
        const response = await axios.post('/currencies', data);
        return response.data;
    },

    updateCurrency: async (id: number, data: Partial<Currency>): Promise<Currency> => {
        const response = await axios.put(`/currencies/${id}`, data);
        return response.data;
    },

    deleteCurrency: async (id: number): Promise<void> => {
        await axios.delete(`/currencies/${id}`);
    }
};
