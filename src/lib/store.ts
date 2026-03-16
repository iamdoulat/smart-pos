import { create } from 'zustand';
import { CompanyService } from './company-service';

interface AuthState {
    user: any | null;
    currentCompany: any | null;
    setUser: (user: any | null) => void;
    setCurrentCompany: (company: any | null) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    refreshCompany: () => Promise<void>;
    sessionYear: string;
    setSessionYear: (year: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    currentCompany: null,
    setUser: (user) => set({ user }),
    setCurrentCompany: (company) => set({ currentCompany: company }),
    refreshCompany: async () => {
        try {
            const companies = await CompanyService.getAll();
            if (companies.length > 0) {
                set({ currentCompany: companies[0] });
            }
        } catch (error) {
            console.error("Failed to refresh company:", error);
        }
    },
    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading }),
    sessionYear: typeof window !== 'undefined' ? (localStorage.getItem('session_year') || new Date().getFullYear().toString()) : new Date().getFullYear().toString(),
    setSessionYear: (year) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('session_year', year);
        }
        set({ sessionYear: year });
    }
}));
