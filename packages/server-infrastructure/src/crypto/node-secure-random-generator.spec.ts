import { NodeSecureRandomGenerator } from './node-secure-random-generator';

describe('Feature: secure randomness', () => {
    const generator = new NodeSecureRandomGenerator();

    describe('Scenario: a hexadecimal token', () => {
        it('has two characters per byte', () => {
            expect(generator.generateHex(16)).toMatch(/^[0-9a-f]{32}$/);
        });
    });

    describe('Scenario: an integer in a range', () => {
        it('stays within the bounds', () => {
            const values = Array.from({ length: 50 }, () =>
                generator.generateInteger(3, 5),
            );
            expect(values.every((value) => value === 3 || value === 4)).toBe(
                true,
            );
        });
    });
});
