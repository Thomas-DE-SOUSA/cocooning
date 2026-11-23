import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { createTestCouple } from '@cocooning/couple-e2e-shared/fixtures';
import { CoupleRepository } from '@cocooning/couple-server-business-logic/pairing';
import { SharedKernelExceptionCodeEnum } from '@cocooning/shared-kernel/exceptions';
import {
    FIRST,
    newCoupleWith,
    SECOND,
    STRANGER,
} from './couple-repository-test-data';
import { PairingTestApp } from './pairing-test-app';
import { PARTNER_A } from './pairing-test-data';

describe('Feature: the Prisma adapter of CoupleRepository translates database errors', () => {
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

    describe('Scenario: a unique index answers', () => {
        it.each([
            [
                'a partner already in a couple',
                PARTNER_A,
                'EEEEEEEE',
                PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
            ],
            [
                'a code already drawn',
                STRANGER,
                'AAAAAAAA',
                PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_CONFLICT,
            ],
        ])(
            'maps %s to its domain code',
            async (_label, creator, code, expected) => {
                await expect(
                    repository.save(newCoupleWith(creator, code)),
                ).rejects.toMatchObject({
                    code: expected,
                });
                await expect(
                    pairing.prisma.includingDeleted.couple.count(),
                ).resolves.toBe(2);
            },
        );
    });

    describe('Scenario: corrupted rows', () => {
        it.each([
            [
                'a code without its deadline',
                { invitationCodeExpiresAt: null },
                PairingExceptionCodeEnum.PAIRING_COUPLE_DATA_CORRUPTED,
            ],
            [
                'an unknown status',
                { pairingStatus: 'DIVORCED' },
                SharedKernelExceptionCodeEnum.ENUM_VALUE_INVALID,
            ],
        ])('refuses %s', async (_label, override, expected) => {
            await createTestCouple(pairing.prisma, {
                ...FIRST,
                ...override,
                coupleId: '01936b2e-7c4a-7000-8000-0000000000f4',
                partnerUserIds: [STRANGER],
                invitationCode: 'FFFFFFFF',
            });
            await expect(
                repository.findByPartner(STRANGER),
            ).rejects.toMatchObject({ code: expected });
        });
    });
});
