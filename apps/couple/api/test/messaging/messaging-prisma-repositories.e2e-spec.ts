import type { INestApplication } from '@nestjs/common';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import {
    createTestFlashMessages,
    createTestInstantPhotos,
    type TestFlashMessage,
    type TestInstantPhoto,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    FlashMessageRepository,
    InstantPhotoRepository,
} from '@cocooning/couple-server-business-logic/messaging';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import {
    COUPLE_ID,
    NOW,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    STRANGER,
} from './messaging-test-data';

const idOf = (suffix: string): string =>
    `01936b2e-7c4a-7000-8000-0000000000${suffix}`;

const aWord = (suffix: string, overrides: Partial<TestFlashMessage> = {}) => ({
    flashMessageId: idOf(suffix),
    coupleId: COUPLE_ID,
    ownerId: PARTNER_A,
    text: 'Bisous',
    sentAt: NOW,
    deletedAt: null,
    ...overrides,
});

const aPhoto = (suffix: string, overrides: Partial<TestInstantPhoto> = {}) => ({
    instantPhotoId: idOf(suffix),
    coupleId: COUPLE_ID,
    ownerId: PARTNER_B,
    contentType: 'image/jpeg',
    photoPromptId: null,
    isLate: false,
    sentAt: NOW,
    deletedAt: null,
    ...overrides,
});

const WORDS = [
    aWord('a1'),
    aWord('a2', { deletedAt: NOW }),
    aWord('a3'),
    aWord('c1', { coupleId: OTHER_COUPLE_ID, ownerId: STRANGER }),
];
const CORRUPTED_PHOTO = aPhoto('e1', { contentType: 'image/gif' });

describe('Feature: the Prisma adapters of the messaging repositories', () => {
    let app: INestApplication;
    let flashMessages: FlashMessageRepository;
    let instantPhotos: InstantPhotoRepository;

    beforeAll(async () => {
        app = await createTestApp({ controllers: [], overrides: [] });
        flashMessages = app.get(FlashMessageRepository);
        instantPhotos = app.get(InstantPhotoRepository);
    });
    afterAll(() => closeTestApp(app));
    beforeEach(async () => {
        const prisma = app.get(PrismaService);
        await truncateAllTables(prisma);
        await createTestFlashMessages(prisma, WORDS);
        await createTestInstantPhotos(prisma, [aPhoto('b1')]);
    });

    const idsOf = (items: ReadonlyArray<{ id: { getValue(): string } }>) =>
        items.map(({ id }) => id.getValue());

    it('reads the newest live words of the couple, below the cursor', async () => {
        expect(
            idsOf(await flashMessages.findNewest(COUPLE_ID, null, 10)),
        ).toEqual([idOf('a3'), idOf('a1')]);
        expect(
            idsOf(await flashMessages.findNewest(COUPLE_ID, idOf('a3'), 10)),
        ).toEqual([idOf('a1')]);
        expect(
            idsOf(await flashMessages.findNewest(COUPLE_ID, null, 1)),
        ).toEqual([idOf('a3')]);
    });

    it('gives nothing to another couple (core.md rule 27)', async () => {
        await expect(
            flashMessages.findById(OTHER_COUPLE_ID, idOf('a1')),
        ).resolves.toBeNull();
        await expect(
            instantPhotos.findById(OTHER_COUPLE_ID, idOf('b1')),
        ).resolves.toBeNull();
        expect(
            idsOf(await instantPhotos.findNewest(OTHER_COUPLE_ID, null, 10)),
        ).toEqual([]);
    });

    it('never gives a withdrawn word (R6)', async () => {
        await expect(
            flashMessages.findById(COUPLE_ID, idOf('a2')),
        ).resolves.toBeNull();
    });

    it('refuses a stale version with FLASH_MESSAGE_VERSION_CONFLICT', async () => {
        const first = await flashMessages.findById(COUPLE_ID, idOf('a1'));
        const second = await flashMessages.findById(COUPLE_ID, idOf('a1'));
        if (first === null || second === null) throw new Error('word missing');
        first.withdraw(PARTNER_A, NOW);
        second.withdraw(PARTNER_A, NOW);
        await flashMessages.save(first);
        await expect(flashMessages.save(second)).rejects.toMatchObject({
            code: MessagingExceptionCodeEnum.FLASH_MESSAGE_VERSION_CONFLICT,
        });
    });

    it('refuses a stale version with INSTANT_PHOTO_VERSION_CONFLICT', async () => {
        const first = await instantPhotos.findById(COUPLE_ID, idOf('b1'));
        const second = await instantPhotos.findById(COUPLE_ID, idOf('b1'));
        if (first === null || second === null) throw new Error('photo missing');
        first.withdraw(PARTNER_B, NOW);
        second.withdraw(PARTNER_B, NOW);
        await instantPhotos.save(first);
        await expect(instantPhotos.save(second)).rejects.toMatchObject({
            code: MessagingExceptionCodeEnum.INSTANT_PHOTO_VERSION_CONFLICT,
        });
    });

    it('answers INSTANT_PHOTO_DATA_CORRUPTED on an unknown content type', async () => {
        await createTestInstantPhotos(app.get(PrismaService), [
            CORRUPTED_PHOTO,
        ]);
        await expect(
            instantPhotos.findById(COUPLE_ID, CORRUPTED_PHOTO.instantPhotoId),
        ).rejects.toMatchObject({
            code: MessagingExceptionCodeEnum.INSTANT_PHOTO_DATA_CORRUPTED,
        });
    });
});
