import api from "./axios";

export interface PaymentConfiguration {
    id: number;
    user_id: number;
    name: string;
    provider: 'paypal' | 'stripe' | 'cash' | 'card' | 'interac';
    client_id: string;
    client_secret?: string;
    is_live: boolean;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export const PaymentService = {
    getConfigurations: async (): Promise<PaymentConfiguration[]> => {
        const response = await api.get("/payment-configurations");
        return response.data;
    },

    createConfiguration: async (data: Partial<PaymentConfiguration>): Promise<PaymentConfiguration> => {
        const response = await api.post("/payment-configurations", data);
        return response.data;
    },

    updateConfiguration: async (id: number, data: Partial<PaymentConfiguration>): Promise<PaymentConfiguration> => {
        const response = await api.put(`/payment-configurations/${id}`, data);
        return response.data;
    },

    deleteConfiguration: async (id: number): Promise<void> => {
        await api.delete(`/payment-configurations/${id}`);
    }
};
