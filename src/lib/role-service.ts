import axios from "./axios";

export interface Role {
    id: number;
    name: string;
    permissions: string[];
    users?: { id: number; name: string }[];
    users_count?: number;
    is_admin?: boolean;
    created_at?: string;
    updated_at?: string;
}

export const RoleService = {
    getAllRoles: async (): Promise<Role[]> => {
        const response = await axios.get("/roles");
        return response.data.map((role: any) => ({
            ...role,
            permissions: role.permissions?.map((p: any) => typeof p === 'string' ? p : p.name) || []
        }));
    },

    getRole: async (id: number): Promise<Role> => {
        const response = await axios.get(`/roles/${id}`);
        const role = response.data;
        return {
            ...role,
            permissions: role.permissions?.map((p: any) => typeof p === 'string' ? p : p.name) || []
        };
    },

    createRole: async (data: Partial<Role>): Promise<Role> => {
        const response = await axios.post("/roles", data);
        return response.data;
    },

    updateRole: async (id: number, data: Partial<Role>): Promise<Role> => {
        const response = await axios.put(`/roles/${id}`, data);
        return response.data;
    },

    deleteRole: async (id: number): Promise<void> => {
        await axios.delete(`/roles/${id}`);
    }
};
