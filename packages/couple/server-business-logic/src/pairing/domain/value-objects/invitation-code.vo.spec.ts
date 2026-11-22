import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { SecureRandomGenerator } from '@cocooning/shared-kernel/ports';
import { InvitationCode } from './invitation-code.vo';

const ISSUED_AT = new Date('2026-11-23T10:00:00.000Z');
const EXPIRES_AT = new Date('2026-11-25T10:00:00.000Z');

class FixedHexRandomGenerator extends SecureRandomGenerator {
    readonly requestedByteCounts: number[] = [];

    constructor(private readonly hex: string) {
        super();
    }

    override generateHex(byteCount: number): string {
        this.requestedByteCounts.push(byteCount);
        return this.hex;
    }

    override generateInteger(minInclusive: number): number {
        return minInclusive;
    }
}

describe('Feature: invitation code', () => {
    describe('Scenario: R3, drawing a code', () => {
        it('draws 8 random bytes and maps each one to a sign modulo 32', () => {
            const random = new FixedHexRandomGenerator('00011f20ff7e8081');
            const code = InvitationCode.generate(random, ISSUED_AT, 48);
            expect(random.requestedByteCounts).toEqual([8]);
            expect(code.value).toBe('AB9A98AB');
        });

        it('uses only the 32 unambiguous signs', () => {
            const random = new FixedHexRandomGenerator('0708090a0b0c0d0e');
            expect(InvitationCode.generate(random, ISSUED_AT, 48).value).toBe(
                'HJKLMNPQ',
            );
        });
    });

    describe('Scenario: R4, the code lives for its lifetime', () => {
        const code = InvitationCode.generate(
            new FixedHexRandomGenerator('0000000000000000'),
            ISSUED_AT,
            48,
        );

        it('expires the given number of hours after it was issued', () => {
            expect(code.expiresAt).toEqual(EXPIRES_AT);
        });

        it('is valid until one millisecond before its deadline', () => {
            expect(code.isValidAt(ISSUED_AT)).toBe(true);
            expect(code.isValidAt(new Date(EXPIRES_AT.getTime() - 1))).toBe(
                true,
            );
        });

        it('is no longer valid at its deadline', () => {
            expect(code.isValidAt(EXPIRES_AT)).toBe(false);
        });

        it('hands out a copy of its deadline', () => {
            code.expiresAt.setTime(0);
            expect(code.expiresAt).toEqual(EXPIRES_AT);
        });
    });

    describe('Scenario: R3, reading what the partner typed', () => {
        it('ignores case and whitespace', () => {
            expect(InvitationCode.normalize(' k7mq 2xpa\t')).toBe('K7MQ2XPA');
        });

        it.each([
            ['K7MQ2XP'],
            ['K7MQ2XPAB'],
            ['K7MQ2XP0'],
            ['K7MQ2XPO'],
            ['K7MQ2XP1'],
            ['K7MQ2XPI'],
            ['K7MQ-2XP'],
        ])('refuses %p', (raw) => {
            expect(() => InvitationCode.normalize(raw)).toThrow(
                expect.objectContaining({
                    code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
                }),
            );
        });
    });

    describe('Scenario: comparing and storing a code', () => {
        const code = InvitationCode.from({
            value: 'K7MQ2XPA',
            expiresAt: EXPIRES_AT.toISOString(),
        });

        it('matches its own value only', () => {
            expect(code.matches('K7MQ2XPA')).toBe(true);
            expect(code.matches('K7MQ2XPB')).toBe(false);
        });

        it('round-trips through its snapshot', () => {
            expect(InvitationCode.from(code.toSnapshot()).equals(code)).toBe(
                true,
            );
            expect(code.toSnapshot()).toEqual({
                value: 'K7MQ2XPA',
                expiresAt: EXPIRES_AT.toISOString(),
            });
        });
    });
});
