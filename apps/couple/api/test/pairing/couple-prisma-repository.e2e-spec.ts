import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { createTestCouple } from '@cocooning/couple-e2e-shared/fixtures';
import { CoupleRepository } from '@cocooning/couple-server-business-logic/pairing';
import {
    FIRST,
    found,
    PENDING,
    SECOND,
    STRANGER,
} from './couple-repository-test-data';
import { PairingTestApp } from './pairing-test-app';
import {
    isoAt,
    NOW,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
    PARTNER_D,
} from './pairing-test-data';

describe('Feature: the Prisma adapter of CoupleRepository', () => {
    const pairing = new PairingTestApp();
    let repository: CoupleRepository;

    beforeAll(async () => {
        await pairing.start();
        repository = pairing.nestApp.get(CoupleRepository);
    });
    afterAll(() => pairing.stop());
    beforeEach(async () => {
        await pairing.reset();
        await createTestCouple(pairing.prisma, FIRST);
        await createTestCouple(pairing.prisma, SECOND);
    });

    describe('Scenario: couple isolation (core-backend.md rule 12)', () => {
        it('finds the couple of a partner and of a code, never the other couple', async () => {
            const byPartner = found(await repository.findByPartner(PARTNER_C));
            const byCode = found(
                await repository.findByInvitationCode('BBBBBBBB'),
            );
            expect(byPartner.id.getValue()).toBe(SECOND.coupleId);
            expect(byCode.id.getValue()).toBe(SECOND.coupleId);
            await expect(
                repository.findByPartner(STRANGER),
            ).resolves.toBeNull();
            await expect(
                repository.findByInvitationCode('CCCCCCCC'),
            ).resolves.toBeNull();
        });

        it('saves one couple without touching the other', async () => {
            const second = found(
                await repository.findByInvitationCode('BBBBBBBB'),
            );
            second.join(PARTNER_D, 'BBBBBBBB', NOW);
            await repository.save(second);
            const first = found(await repository.findByPartner(PARTNER_A));
            expect(first.toSnapshot()).toMatchObject({
                version: 1,
                pairingStatus: 'PENDING',
                partners: [{ userId: PARTNER_A }],
            });
            expect(
                found(await repository.findByPartner(PARTNER_D)).version,
            ).toBe(2);
        });
    });

    describe('Scenario: decision 0029, an expired code', () => {
        it('is still found, the aggregate decides', async () => {
            await createTestCouple(pairing.prisma, {
                ...PENDING,
                coupleId: '01936b2e-7c4a-7000-8000-0000000000f3',
                partnerUserIds: [PARTNER_B],
                invitationCode: 'DDDDDDDD',
                invitationCodeExpiresAt: new Date(isoAt(-1)),
            });
            await expect(
                repository.findByInvitationCode('DDDDDDDD'),
            ).resolves.not.toBeNull();
        });
    });

    describe('Scenario: a stale version', () => {
        it('refuses the second save with PAIRING_COUPLE_VERSION_CONFLICT', async () => {
            const read = found(await repository.findByPartner(PARTNER_A));
            const stale = found(await repository.findByPartner(PARTNER_A));
            read.join(PARTNER_B, 'AAAAAAAA', NOW);
            stale.join(PARTNER_D, 'AAAAAAAA', NOW);
            await repository.save(read);
            await expect(repository.save(stale)).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_COUPLE_VERSION_CONFLICT,
            });
        });
    });
});
