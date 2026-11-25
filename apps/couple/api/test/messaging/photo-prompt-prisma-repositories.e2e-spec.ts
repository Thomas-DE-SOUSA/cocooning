import type { INestApplication } from '@nestjs/common';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { truncateAllTables } from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    InstantPhoto,
    InstantPhotoRepository,
    PhotoPrompt,
    PhotoPromptRepository,
} from '@cocooning/couple-server-business-logic/messaging';
import { FakeSecureRandomGenerator } from '@cocooning/shared-kernel/testing';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import {
    COUPLE_ID,
    NOW,
    OTHER_COUPLE_ID,
    PARTNER_A,
    TEN_AM_MINUTE,
} from './messaging-test-data';

const TODAY = '2026-11-24';

const drawn = (coupleId: string): PhotoPrompt => {
    const random = new FakeSecureRandomGenerator();
    random.willReturnIntegers([TEN_AM_MINUTE]);
    return PhotoPrompt.draw({ coupleId, day: TODAY }, random, NOW);
};

describe('Feature: the Prisma adapters of the photo of the day', () => {
    let app: INestApplication;
    let photoPrompts: PhotoPromptRepository;
    let instantPhotos: InstantPhotoRepository;
    let ours: PhotoPrompt;

    beforeAll(async () => {
        app = await createTestApp({ controllers: [], overrides: [] });
        photoPrompts = app.get(PhotoPromptRepository);
        instantPhotos = app.get(InstantPhotoRepository);
    });
    afterAll(() => closeTestApp(app));
    beforeEach(async () => {
        await truncateAllTables(app.get(PrismaService));
        ours = drawn(COUPLE_ID);
        await photoPrompts.saveAll([ours, drawn(OTHER_COUPLE_ID)]);
    });

    const ourId = () => ours.id.getValue();
    const reloaded = async () => {
        const found = await photoPrompts.findById(COUPLE_ID, ourId());
        if (found === null) throw new Error('photo prompt missing');
        return found;
    };

    it('reads back the prompt as drawn, by its couple and its day', async () => {
        expect((await reloaded()).toSnapshot()).toEqual({
            ...ours.toSnapshot(),
            version: 1,
        });
        const ofDay = await photoPrompts.findOfDay([COUPLE_ID], TODAY);
        expect(ofDay.map(({ id }) => id.getValue())).toEqual([ourId()]);
        await expect(
            photoPrompts.findOfDay([COUPLE_ID], '2026-11-25'),
        ).resolves.toEqual([]);
    });

    it('gives nothing to another couple (core.md rule 27)', async () => {
        await expect(
            photoPrompts.findById(OTHER_COUPLE_ID, ourId()),
        ).resolves.toBeNull();
    });

    it('issues every changed prompt in one statement, at the next version', async () => {
        const [first, second] = await photoPrompts.findOfDay(
            [COUPLE_ID, OTHER_COUPLE_ID],
            TODAY,
        );
        first?.issueIfDue(NOW);
        second?.issueIfDue(NOW);
        await photoPrompts.saveAll([first, second].flatMap((p) => p ?? []));
        expect((await reloaded()).toSnapshot()).toMatchObject({
            issuedAt: NOW.toISOString(),
            version: 2,
        });
    });

    it('refuses a stale issue with PHOTO_PROMPT_VERSION_CONFLICT', async () => {
        const first = await reloaded();
        const second = await reloaded();
        first.issueIfDue(NOW);
        second.issueIfDue(NOW);
        await photoPrompts.saveAll([first]);
        await expect(photoPrompts.saveAll([second])).rejects.toMatchObject({
            code: MessagingExceptionCodeEnum.PHOTO_PROMPT_VERSION_CONFLICT,
        });
    });

    it('refuses a second prompt of the day with PHOTO_PROMPT_VERSION_CONFLICT (unique couple and day)', async () => {
        await expect(
            photoPrompts.saveAll([drawn(COUPLE_ID)]),
        ).rejects.toMatchObject({
            code: MessagingExceptionCodeEnum.PHOTO_PROMPT_VERSION_CONFLICT,
        });
    });

    it('refuses a second live photo of the day of a partner with PHOTO_PROMPT_ALREADY_ANSWERED', async () => {
        const issued = await reloaded();
        issued.issueIfDue(NOW);
        const answerOfA = () =>
            InstantPhoto.answer(
                {
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    contentType: 'image/jpeg',
                },
                issued.answerAt(NOW),
                NOW,
            );
        await instantPhotos.save(answerOfA());
        await expect(instantPhotos.save(answerOfA())).rejects.toMatchObject({
            code: MessagingExceptionCodeEnum.PHOTO_PROMPT_ALREADY_ANSWERED,
        });
        await expect(
            instantPhotos.findOfPhotoPrompts(COUPLE_ID, [ourId()]),
        ).resolves.toHaveLength(1);
        await expect(
            instantPhotos.findOfPhotoPrompts(OTHER_COUPLE_ID, [ourId()]),
        ).resolves.toEqual([]);
    });
});
