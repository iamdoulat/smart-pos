import api from './axios';

export interface Product {
    id: number;
    company_id: number;
    item_code: string;
    name: string;
    item_group: string;
    brand_id?: number | null;
    category_id: number;
    variant_id?: number | null;
    unit?: string;
    sku?: string;
    hsn?: string;
    barcode?: string;
    description?: string;
    image_path?: string;
    image_url?: string;
    purchase_price: number;
    price_before_tax?: number;
    tax_id?: string;
    tax_type?: string;
    sales_price: number;
    discount_type?: string;
    discount?: number;
    profit_margin_percent?: number;
    mrp?: number;
    stock_quantity: number;
    opening_stock?: number;
    alert_quantity: number;
    low_stock_threshold: number;
    seller_points?: number;
    warehouse_id?: string;
    created_at?: string;
    updated_at?: string;
    category?: any;
    brand?: any;
    variant?: any;
}

export const ProductService = {
    async getAll(companyId: number): Promise<Product[]> {
        const response = await api.get(`/products?company_id=${companyId}`);
        return response.data;
    },

    async getById(id: number): Promise<Product> {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    async create(data: any): Promise<Product> {
        const config: any = {};
        if (data instanceof FormData) {
            // By setting Content-Type to multipart/form-data here, we specify the intent.
            // Axios will handle appending the boundary automatically if not explicitly set.
            config.headers = { 'Content-Type': 'multipart/form-data' };
        }
        const response = await api.post('/products', data, config);
        return response.data;
    },

    async update(id: number, data: any): Promise<Product> {
        // Laravel PUT doesn't support multipart/form-data out of the box with many clients.
        // We use POST with _method=PUT.
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            const response = await api.post(`/products/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/products/${id}`);
    },
};
