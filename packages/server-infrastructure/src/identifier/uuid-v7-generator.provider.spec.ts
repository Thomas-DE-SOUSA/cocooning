import { UuidV7GeneratorProvider } from './uuid-v7-generator.provider';

describe('Feature: generate UUID v7 identifiers', () => {
    const generator = new UuidV7GeneratorProvider();

    describe('Scenario: generation', () => {
        it('generates valid, time-ordered v7 identifiers', () => {
            const first = generator.generate();
            const second = generator.generate();
            expect(generator.isValid(first)).toBe(true);
            expect(first < second).toBe(true);
        });
    });

    describe('Scenario: validation', () => {
        it('rejects another UUID version and garbage', () => {
            expect(
                generator.isValid('6f1c3a52-6f0e-4d4b-9a7e-2b8f0c1d2e3f'),
            ).toBe(false);
            expect(generator.isValid('not-a-uuid')).toBe(false);
        });
    });
});
