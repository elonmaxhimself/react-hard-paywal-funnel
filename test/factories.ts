/**
 * Test factories — reusable builders for test data.
 *
 * Usage:
 *   const user = createAuthResponse({ userId: 99 });
 *   const payload = createSignUpPayload({ email: 'custom@test.com' });
 */

import type { AuthResponse, MeResponse, SignUpPayload } from '@/utils/types/auth';

// ─── Auth ────────────────────────────────────────────────────────────────────

export function createAuthResponse(overrides: Partial<AuthResponse> = {}): AuthResponse {
    return {
        authToken: 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ userId: 42, email: 'test@test.com' })) + '.sig',
        userId: 42,
        ...overrides,
    };
}

export function createMeResponse(overrides: Partial<MeResponse> = {}): MeResponse {
    return {
        id: 42,
        isPremium: false,
        ...overrides,
    };
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

export function createJWT(payload: Record<string, unknown> = { userId: 42, email: 'test@test.com' }): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.fake-signature`;
}

// ─── Funnel form values (minimal valid shape) ────────────────────────────────

export function createFunnelFormValues(overrides: Record<string, unknown> = {}) {
    return {
        style: 'realistic',
        age: '20-25',
        personality_traits: ['funny'],
        interests: ['gaming'],
        ethnicity: 'caucasian',
        your_type: ['cute'],
        body: 'slim',
        breast_type: 'natural',
        breast_size: 'medium',
        butt: 'medium',
        eyes: 'blue',
        hair_style: 'long',
        hair_color: 'blonde',
        character_relationship: 'girlfriend',
        scenario: 'dating',
        characterPrompt: 'A fun companion',
        greeting: 'Hey there!',
        clothes: 'casual',
        turns_of_you: ['humor'],
        want_to_try: ['roleplay'],
        voice: 'seducing',
        connections: ['emotional'],
        preferred_age: '20-25',
        user_age: '25-30',
        preferred_relationship: 'casual',
        practiceForeignLanguage: false,
        receiveSpicyContent: true,
        dirtyTalks: true,
        turns_off_in_dating: ['ghosting'],
        experience_filings_of_loneliness: 'sometimes',
        receiveCustomPhotos: true,
        receiveVoiceMessages: true,
        receiveCustomVideos: true,
        receiveVideoCalls: true,
        productId: 105,
        ...overrides,
    };
}

// ─── Sign-up payload ─────────────────────────────────────────────────────────

export function createSignUpPayload(overrides: Partial<SignUpPayload> = {}): SignUpPayload {
    return {
        email: 'test@example.com',
        password: 'Password1',
        utmOnRegistration: {},
        url: 'https://test.com',
        createCharFunnelOptions: {
            funnelOptions: createFunnelFormValues() as SignUpPayload['createCharFunnelOptions']['funnelOptions'],
            dtoAdultFannelV3: {
                character_options: {
                    funnel: 'cc_funnel_juicy',
                    character: {
                        age: 22,
                        sex: 'female',
                        body: 'slim',
                        butt: 'medium',
                        eyes: 'blue',
                        kinks: ['humor', 'roleplay'],
                        style: 'realistic',
                        voice: '17',
                        breast: 'medium-natural',
                        clothes: 'casual',
                        greeting: 'Hey there!',
                        scenario: 'dating',
                        ethnicity: 'caucasian',
                        hair_color: 'blonde',
                        hair_style: 'long',
                        sex_position: 'missionary',
                        characterPrompt: 'A fun companion',
                    },
                    funnel_step: 10,
                },
            },
            isCharacterGenerated: false,
        },
        ...overrides,
    };
}

// ─── Shift4 ──────────────────────────────────────────────────────────────────

export function createShift4Response(overrides: Record<string, unknown> = {}) {
    return {
        status: 'subscription_initiated',
        subscriptionId: 'sub_test_123',
        ...overrides,
    };
}

export function createPaymentStatusResponse(overrides: Record<string, unknown> = {}) {
    return {
        subscriptionId: 'sub_test_123',
        paid_status: 'paid' as string,
        events: [],
        ...overrides,
    };
}
