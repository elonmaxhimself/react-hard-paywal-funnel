import { describe, expect, it } from 'vitest';

import { createFunnelSchema } from './validation';
import { createFunnelFormValues } from '../../../test/factories';

// Mock t() — returns the key as-is (matches global setup)
const t = (key: string) => key;

const schema = createFunnelSchema(t);

describe('createFunnelSchema', () => {
    it('accepts valid complete form values', () => {
        const values = createFunnelFormValues();
        const result = schema.safeParse(values);
        expect(result.success).toBe(true);
    });

    describe('required string fields', () => {
        const requiredStrings = [
            'style',
            'age',
            'ethnicity',
            'body',
            'breast_type',
            'breast_size',
            'butt',
            'eyes',
            'hair_style',
            'hair_color',
            'character_relationship',
            'scenario',
            'characterPrompt',
            'greeting',
            'clothes',
            'voice',
            'preferred_age',
            'user_age',
            'preferred_relationship',
            'experience_filings_of_loneliness',
        ] as const;

        it.each(requiredStrings)('rejects empty "%s"', (field) => {
            const values = createFunnelFormValues({ [field]: '' });
            const result = schema.safeParse(values);
            expect(result.success).toBe(false);
        });

        it.each(requiredStrings)('rejects whitespace-only "%s"', (field) => {
            const values = createFunnelFormValues({ [field]: '   ' });
            const result = schema.safeParse(values);
            expect(result.success).toBe(false);
        });
    });

    describe('required array fields', () => {
        const requiredArrays = [
            'personality_traits',
            'interests',
            'your_type',
            'turns_of_you',
            'want_to_try',
            'connections',
            'turns_off_in_dating',
        ] as const;

        it.each(requiredArrays)('rejects empty array for "%s"', (field) => {
            const values = createFunnelFormValues({ [field]: [] });
            const result = schema.safeParse(values);
            expect(result.success).toBe(false);
        });

        it.each(requiredArrays)('accepts non-empty array for "%s"', (field) => {
            const values = createFunnelFormValues({ [field]: ['value'] });
            const result = schema.safeParse(values);
            expect(result.success).toBe(true);
        });
    });

    describe('boolean fields', () => {
        it('accepts boolean values for toggle fields', () => {
            const values = createFunnelFormValues({
                practiceForeignLanguage: true,
                receiveSpicyContent: true,
                dirtyTalks: false,
                receiveCustomPhotos: false,
                receiveVoiceMessages: true,
                receiveCustomVideos: true,
                receiveVideoCalls: false,
            });
            const result = schema.safeParse(values);
            expect(result.success).toBe(true);
        });
    });

    describe('productId', () => {
        it('accepts valid product ID', () => {
            const values = createFunnelFormValues({ productId: 105 });
            const result = schema.safeParse(values);
            expect(result.success).toBe(true);
        });

        it('accepts null productId', () => {
            const values = createFunnelFormValues({ productId: null });
            const result = schema.safeParse(values);
            expect(result.success).toBe(true);
        });
    });

    describe('multiple validation errors', () => {
        it('reports all failing fields', () => {
            const values = createFunnelFormValues({
                style: '',
                age: '',
                personality_traits: [],
            });
            const result = schema.safeParse(values);
            expect(result.success).toBe(false);
            if (!result.success) {
                const fieldNames = result.error.issues.map((i) => i.path[0]);
                expect(fieldNames).toContain('style');
                expect(fieldNames).toContain('age');
                expect(fieldNames).toContain('personality_traits');
            }
        });
    });
});
