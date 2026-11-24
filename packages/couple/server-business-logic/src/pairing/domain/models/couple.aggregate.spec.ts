import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { FakeUuidV7GeneratorProvider } from '@cocooning/shared-kernel/testing';
import {
    aCreateCoupleInput,
    INVITATION_CODE_EXPIRES_AT,
    INVITATION_CODE_VALUE,
} from '../../__tests__/builders/create-couple-input.builder';
import {
    NOW,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
} from '../../__tests__/fixtures/pairing-test.context';
import { CoupleId } from '../value-objects/couple-id.vo';
import { InvitationCode } from '../value-objects/invitation-code.vo';
import { TogetherPeriods } from '../value-objects/together-periods.vo';
import { Couple } from './couple.aggregate';

const LATER = new Date('2026-11-24T10:00:00.000Z');
const RENEWED_CODE = InvitationCode.from({
    value: 'RENEWED2',
    expiresAt: '2026-11-26T10:00:00.000Z',
});

const PERIODS = TogetherPeriods.from([
    { startedOn: '2020-01-10', endedOn: null },
]);

const pairedCouple = (): Couple => {
    const couple = Couple.create(aCreateCoupleInput(), NOW);
    couple.join(PARTNER_B, INVITATION_CODE_VALUE, LATER);
    couple.clearDomainEvents();
    return couple;
};

describe('Feature: the couple aggregate', () => {
    beforeEach(() => CoupleId.configure(new FakeUuidV7GeneratorProvider()));
    afterEach(() => CoupleId.resetForTests());

    describe('Scenario: INV-001, a partner cannot join a couple twice', () => {
        it('refuses the creator entering their own code', () => {
            const couple = Couple.create(aCreateCoupleInput(), NOW);
            expect(() =>
                couple.join(PARTNER_A, INVITATION_CODE_VALUE, LATER),
            ).toThrow(
                expect.objectContaining({
                    code: PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
                }),
            );
        });
    });

    describe('Scenario: INV-002, a formed couple has no code to join with', () => {
        it('refuses a third partner, even with the former code', () => {
            const couple = pairedCouple();
            expect(() =>
                couple.join(PARTNER_C, INVITATION_CODE_VALUE, LATER),
            ).toThrow(
                expect.objectContaining({
                    code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
                }),
            );
            expect(couple.partners).toHaveLength(2);
        });

        it('refuses a third partner on a paired couple that still had a code', () => {
            const snapshot = pairedCouple().toSnapshot();
            const couple = Couple.fromSnapshot({
                ...snapshot,
                invitationCode: {
                    value: INVITATION_CODE_VALUE,
                    expiresAt: INVITATION_CODE_EXPIRES_AT,
                },
            });
            expect(() =>
                couple.join(PARTNER_C, INVITATION_CODE_VALUE, LATER),
            ).toThrow(
                expect.objectContaining({
                    code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
                }),
            );
        });
    });

    describe('Scenario: R6, the code does not match', () => {
        it('refuses the partner as with any invalid code', () => {
            const couple = Couple.create(aCreateCoupleInput(), NOW);
            expect(() => couple.join(PARTNER_B, 'K7MQ2XPB', LATER)).toThrow(
                expect.objectContaining({
                    code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
                }),
            );
            expect(couple.pairingStatus).toBe(CouplePairingStatusEnum.PENDING);
        });
    });

    describe('Scenario: INV-003, only a member acts on the couple', () => {
        it('answers a stranger asking for a new code that the couple is not found', () => {
            const couple = Couple.create(aCreateCoupleInput(), NOW);
            expect(() =>
                couple.renewInvitationCode(PARTNER_C, RENEWED_CODE, LATER),
            ).toThrow(
                expect.objectContaining({
                    code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
                }),
            );
            expect(couple.invitationCode?.value).toBe(INVITATION_CODE_VALUE);
        });
    });

    describe('Scenario: INV-010, only a member of a formed couple records its periods', () => {
        it('answers a stranger that the couple is not found', () => {
            const couple = pairedCouple();
            expect(() =>
                couple.recordTogetherPeriods(PARTNER_C, PERIODS, LATER),
            ).toThrow(
                expect.objectContaining({
                    code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
                }),
            );
            expect(couple.togetherPeriods.count).toBe(0);
            expect(couple.getDomainEvents()).toEqual([]);
        });
    });

    describe('Scenario: INV-004, the version belongs to the database', () => {
        it('keeps the version it was read with through every change', () => {
            const couple = Couple.fromSnapshot({
                ...Couple.create(aCreateCoupleInput(), NOW).toSnapshot(),
                version: 7,
            });
            couple.renewInvitationCode(PARTNER_A, RENEWED_CODE, LATER);
            couple.join(PARTNER_B, 'RENEWED2', LATER);
            expect(couple.version).toBe(7);
        });
    });

    describe('Scenario: storing and reading a couple', () => {
        it('rebuilds the same couple from its snapshot', () => {
            const couple = pairedCouple();
            couple.recordTogetherPeriods(PARTNER_A, PERIODS, LATER);
            expect(couple.toSnapshot().togetherPeriods).toEqual([
                { startedOn: '2020-01-10', endedOn: null },
            ]);
            expect(
                Couple.fromSnapshot(couple.toSnapshot()).toSnapshot(),
            ).toEqual(couple.toSnapshot());
        });

        it('hands out a copy of each join date', () => {
            const couple = pairedCouple();
            couple.partners[1]?.joinedAt.setTime(0);
            expect(couple.partners[1]?.joinedAt).toEqual(LATER);
        });
    });
});
