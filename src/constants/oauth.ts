export const OAUTH_PROVIDERS = ["google", "twitter", "discord"] as const;
export type OAuthProviderType = typeof OAUTH_PROVIDERS[number];