import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { createTestCouple } from '@cocooning/couple-e2e-shared/fixtures';
import {
    CoupleRepository,
    TogetherPeriods,
} from '@cocooning/couple-server-business-logic/pairing';
import { FIRST, found } from './couple-repository-test-data';
import { PairingTestApp } from './pairing-test-app';
import { NOW, PARTNER_A, PARTNER_B } from './pairing-test-data';

const PERIODS = [
    { startedOn: '2020-01-10', endedOn: '2021-03-04' },
    { startedOn: '2022-05-01', endedOn: null },
];

describe('Feature: the Prisma adapter of CoupleRepository stores the together periods (R9)', () => {
    const pairing = new PairingTestApp();
    let repository: CoupleRepository;

    beforeAll(async () => {
        await pairing.start();
        repository = pairing.nestApp.get(CoupleRepository);
    });
    afterAll(() => pairing.stop());
    beforeEach(async () => {
        await pairing.reset();
        await createTestCouple(pairing.prisma, {
            ...FIRST,
            pairingStatus: 'PAIRED',
            partnerUserIds: [PARTNER_A, PARTNER_B],
            invitationCode: null,
            invitationCodeExpiresAt: null,
        });
    });

    describe('Scenario: a couple written before the periods existed', () => {
        it('reads an empty list', async () => {
            const couple = found(await repository.findByPartner(PARTNER_A));
            expect(couple.toSnapshot().togetherPeriods).toEqual([]);
        });
    });

    describe('Scenario: recorded periods', () => {
        it('round-trips them in their order', async () => {
            const couple = found(await repository.findByPartner(PARTNER_A));
            couple.recordTogetherPeriods(
                PARTNER_A,
                TogetherPeriods.create(PERIODS, NOW),
                NOW,
            );
            await repository.save(couple);
            const stored = found(await repository.findByPartner(PARTNER_B));
            expect(stored.toSnapshot()).toMatchObject({
                togetherPeriods: PERIODS,
                version: 2,
            });
        });
    });

    describe('Scenario: corrupted rows (core.md rule 11)', () => {
        it.each([
            ['an object instead of a list', { startedOn: '2020-01-10' }],
            ['a period without its end', [{ startedOn: '2020-01-10' }]],
            ['a day that is not a day', [{ startedOn: 'soon', endedOn: null }]],
        ])('refuses %s', async (_label, column) => {
            await pairing.prisma.current.couple.update({
                where: { id: FIRST.coupleId },
                data: { togetherPeriods: column },
            });
            await expect(
                repository.findByPartner(PARTNER_A),
            ).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_COUPLE_DATA_CORRUPTED,
            });
        });
    });
});
