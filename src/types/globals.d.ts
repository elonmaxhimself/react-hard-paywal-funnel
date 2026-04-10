// Third-party SDK globals loaded via script tags in index.html

interface Shift4TokenResult {
    id?: string;
    error?: { message: string };
}

interface Shift4ComponentGroup {
    automount(selector: string): void;
    unmount(): void;
}

interface Shift4Instance {
    createToken(group: Shift4ComponentGroup): Promise<Shift4TokenResult>;
    verifyThreeDSecure(options: { amount: number; currency: string; card?: string }): Promise<Shift4TokenResult>;
    createComponentGroup(options: Record<string, unknown>): Shift4ComponentGroup;
}

type Shift4Constructor = (publicKey: string) => Shift4Instance;

type FacebookPixelCommand = 'init' | 'track' | 'trackCustom' | 'trackSingle' | 'trackSingleCustom';

interface DataLayerEvent {
    event?: string;
    [key: string]: unknown;
}

interface TaboolaEvent {
    notify: string;
    name: string;
    id: number;
    [key: string]: unknown;
}

interface Window {
    Shift4?: Shift4Constructor;
    fbq?: (command: FacebookPixelCommand, ...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: DataLayerEvent[];
    _tfa?: TaboolaEvent[];
}
