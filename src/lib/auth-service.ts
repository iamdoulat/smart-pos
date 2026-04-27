import api from './axios';

export const AuthService = {
    async register(data: any) {
        const response = await api.post('/register', data);
        // Registration no longer returns a token - user must verify email first
        return response.data;
    },

    async login(data: any) {
        const response = await api.post('/login', data);
        if (response.data.access_token) {
            localStorage.setItem('auth_token', response.data.access_token);
            document.cookie = `auth_token=${response.data.access_token}; path=/; max-age=604800; SameSite=Lax`;
        }
        return response.data;
    },

    async logout() {
        try {
            await api.post('/logout');
        } finally {
            localStorage.removeItem('auth_token');
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    },

    async me() {
        const response = await api.get('/me');
        return response.data;
    },

    async updateProfile(data: any) {
        const response = await api.post('/profile?_method=PUT', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async updatePassword(data: { current_password: string; password: string; password_confirmation: string }) {
        const response = await api.put('/password', data);
        return response.data;
    },

    async forgotPassword(data: { email: string }) {
        const response = await api.post('/forgot-password', data);
        return response.data;
    },

    async resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }) {
        const response = await api.post('/reset-password', data);
        return response.data;
    },

    async resendVerification(email: string) {
        const response = await api.post('/email/resend', { email });
        return response.data;
    },
};
