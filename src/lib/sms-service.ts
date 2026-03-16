import axios from "@/lib/axios";

export interface SmsConfiguration {
    id: number;
    name: string;
    provider: string;
    account_sid: string;
    auth_token?: string;
    from_number: string;
    daily_limit: number;
    daily_usage: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const SmsService = {
    getConfigurations: async (): Promise<SmsConfiguration[]> => {
        const response = await axios.get("/sms-configurations");
        return response.data;
    },

    createConfiguration: async (data: Partial<SmsConfiguration>): Promise<SmsConfiguration> => {
        const response = await axios.post("/sms-configurations", data);
        return response.data;
    },

    updateConfiguration: async (id: number, data: Partial<SmsConfiguration>): Promise<SmsConfiguration> => {
        const response = await axios.put(`/sms-configurations/${id}`, data);
        return response.data;
    },

    deleteConfiguration: async (id: number): Promise<void> => {
        await axios.delete(`/sms-configurations/${id}`);
    },

    sendTestSms: async (id: number, phone: string): Promise<{ success: boolean; message: string }> => {
        const response = await axios.post(`/sms-configurations/${id}/send-test-sms`, { phone });
        return response.data;
    }
};
