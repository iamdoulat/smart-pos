import api from './axios';

export interface User {
    id: number;
    name: string;
    email: string;
    description?: string;
    phone?: string;
    role?: string;
    designation?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export const UserService = {
    async getAllUsers(): Promise<User[]> {
        const response = await api.get('/users');
        return response.data;
    },

    async createUser(data: Partial<User> & { password?: string }): Promise<User> {
        const response = await api.post('/users', data);
        return response.data;
    },

    async updateUser(id: number, data: Partial<User> & { password?: string }): Promise<User> {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    async deleteUser(id: number): Promise<void> {
        await api.delete(`/users/${id}`);
    },

    async toggleActive(id: number, is_active: boolean): Promise<User> {
        const response = await api.put(`/users/${id}/toggle-active`, { is_active });
        return response.data.user;
    },
};
