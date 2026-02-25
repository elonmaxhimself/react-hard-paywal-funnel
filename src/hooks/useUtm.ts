import { useEffect } from "react";
import { useUtmStore } from "@/store/states/utm";

const OAUTH_PROVIDERS = ["google", "twitter", "discord"];

function isOAuthRedirect(params: URLSearchParams): boolean {
    const state = params.get("state");
    return !!(params.get("code") && state && OAUTH_PROVIDERS.includes(state));
}

export function useInitUtm() {
    const merge = useUtmStore((state) => state.merge);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        if (isOAuthRedirect(searchParams)) return;

        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        if (Object.keys(params).length > 0) merge(params);
    }, []);
}