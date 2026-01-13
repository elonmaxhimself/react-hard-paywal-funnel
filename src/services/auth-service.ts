import { AuthResponse, SignUpPayload } from "@/utils/types/auth";

const BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL || "https://devapi.mydreamcompanion.com";

export const authService = {
    signUp: async (data: SignUpPayload): Promise<AuthResponse> => {
        const response = await fetch(`${BASE_URL}/auth/signup/adult/v3`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    },
};