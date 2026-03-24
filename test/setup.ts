import { afterEach, vi } from 'vitest';

import { cleanup } from '@testing-library/react';

import '@testing-library/jest-dom/vitest';

// Automatic cleanup after each test
afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en', changeLanguage: vi.fn() },
    }),
    Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

// Mock posthog-js/react
vi.mock('posthog-js/react', () => ({
    usePostHog: () => ({
        capture: vi.fn(),
        identify: vi.fn(),
        getFeatureFlag: vi.fn(),
    }),
    PostHogProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Polyfill BroadcastChannel for jsdom
if (typeof globalThis.BroadcastChannel === 'undefined') {
    globalThis.BroadcastChannel = vi.fn().mockImplementation(() => ({
        postMessage: vi.fn(),
        close: vi.fn(),
        onmessage: null,
        onmessageerror: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })) as unknown as typeof BroadcastChannel;
}

// Polyfill window.matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Polyfill ResizeObserver for jsdom (must be a class for `new ResizeObserver()`)
global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(_callback: ResizeObserverCallback) {}
} as unknown as typeof globalThis.ResizeObserver;

// Mock environment variables
vi.stubEnv('VITE_PUBLIC_API_BASE_URL', 'http://localhost:4000');
vi.stubEnv('VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY', 'pk_test_123');
vi.stubEnv('VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT', 'https://test.com');
vi.stubEnv('VITE_PUBLIC_POSTHOG_TOKEN', 'phc_test');
vi.stubEnv('VITE_PUBLIC_POSTHOG_HOST', 'https://eu.i.posthog.com');
