import axios from "@/lib/axios";
import { AuthResponse, SignUpPayload } from "@/utils/types/auth";
import { getUtmStore } from "@/store/states/utm";
import { getAuthStore } from "@/store/states/auth";
import { OAuthProviderType } from "@/constants/oauth";

export const authService = {
    signUp: async (data: SignUpPayload): Promise<AuthResponse> => {
        const response = await axios.post<AuthResponse>("/auth/signup/adult/v3", data);
        return response.data;
    },

    signInWithOAuth: async (provider: OAuthProviderType) => {
        const redirectUrl = window.location.origin + window.location.pathname;
        const response = await axios.get(`/auth/${provider}`, {
            params: { redirectUrl },
        });
        return response.data;
    },

    verifyOAuthToken: async (provider: OAuthProviderType, payload: { code: string; state?: string }) => {
        const redirectUrl = window.location.origin + window.location.pathname;
        const { utm } = getUtmStore();
        const url = import.meta.env.DEV ? "https://mdc-react-funnel-v4-dev.pages.dev/" : window.location.href;
        const { oauthState } = getAuthStore();
        const response = await axios.post(
            `/auth/${provider}/token`,
            {
                ...payload,
                utmOnRegistration: utm,
                referrer: oauthState?.referrer,
                url
            },
            {
                params: { redirectUrl },
            },
        );
        return response.data;
    },
};