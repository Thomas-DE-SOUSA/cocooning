import type { INestApplication } from '@nestjs/common';
import {
    createTestCouple,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import { PairedCoupleProvider } from '@cocooning/couple-server-business-logic/notes';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import {
    COUPLE_ID,
    NOW,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    STRANGER,
} from './note-repository-test-data';

describe('Feature: the couple of a partner, read from pairing (decision 0041)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let provider: PairedCoupleProvider;

    beforeAll(async () => {
        app = await createTestApp({ controllers: [], overrides: [] });
        prisma = app.get(PrismaService);
        provider = app.get(PairedCoupleProvider);
    });
    afterAll(() => closeTestApp(app));
    beforeEach(async () => {
        await truncateAllTables(prisma);
        await createTestCouple(prisma, {
            coupleId: COUPLE_ID,
            partnerUserIds: [PARTNER_A, PARTNER_B],
            pairingStatus: 'PAIRED',
            invitationCode: null,
            invitationCodeExpiresAt: null,
            createdAt: NOW,
        });
        await createTestCouple(prisma, {
            coupleId: OTHER_COUPLE_ID,
            partnerUserIds: [STRANGER],
            pairingStatus: 'PENDING',
            invitationCode: 'AAAAAAAA',
            invitationCodeExpiresAt: new Date(NOW.getTime() + 3_600_000),
            createdAt: NOW,
        });
    });

    it('gives the formed couple to both its partners', async () => {
        await expect(provider.findPairedCoupleIdOf(PARTNER_A)).resolves.toBe(
            COUPLE_ID,
        );
        await expect(provider.findPairedCoupleIdOf(PARTNER_B)).resolves.toBe(
            COUPLE_ID,
        );
    });

    it('answers null for a pending couple and for a partner without couple (R3)', async () => {
        await expect(
            provider.findPairedCoupleIdOf(STRANGER),
        ).resolves.toBeNull();
        await expect(
            provider.findPairedCoupleIdOf(
                '01936b2e-7c4a-7000-8000-0000000000ff',
            ),
        ).resolves.toBeNull();
    });

    it('answers null for a soft-deleted couple', async () => {
        await prisma.includingDeleted.couple.update({
            where: { id: COUPLE_ID },
            data: { deletedAt: NOW },
        });
        await expect(
            provider.findPairedCoupleIdOf(PARTNER_A),
        ).resolves.toBeNull();
    });
});
