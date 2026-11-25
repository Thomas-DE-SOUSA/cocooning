import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { readMessagingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import {
    PhotoPromptDrawnEvent,
    PhotoPromptIssuedEvent,
} from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { MessagingTestApp } from './messaging-test-app';
import {
    ALONE,
    COUPLE_ID,
    MIDNIGHT,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    refusal,
    SEVEN_AM,
    STRANGER,
    TEN_AM,
    TEN_AM_MINUTE,
    todayPhotoPromptOf,
} from './messaging-test-data';

const BY_THE_APP = '00000000-0000-0000-0000-000000000000';

describe('Feature: the scheduled task draws, then issues the photo prompt of the day (R7)', () => {
    const messaging = new MessagingTestApp();

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(async () => {
        await messaging.reset();
        messaging.clock.setNow(SEVEN_AM);
        messaging.random.willReturnIntegers([TEN_AM_MINUTE, TEN_AM_MINUTE]);
        await messaging.tick();
    });

    const promptOf = (coupleId: string) =>
        messaging.prisma.current.photoPrompt.findFirstOrThrow({
            where: { coupleId },
        });
    const outboxOf = async (coupleId: string) =>
        readMessagingEvents(messaging.prisma, (await promptOf(coupleId)).id);

    it('draws one prompt per formed couple at the drawn minute, kept secret', async () => {
        await expect(promptOf(COUPLE_ID)).resolves.toMatchObject({
            day: new Date('2026-11-24T00:00:00.000Z'),
            scheduledAt: TEN_AM,
            issuedAt: null,
            version: 1,
        });
        await expect(promptOf(OTHER_COUPLE_ID)).resolves.toMatchObject({
            issuedAt: null,
        });
        expect(await messaging.todayPhotoPrompt(PARTNER_A)).toEqual({
            status: 200,
            body: { photoPrompt: null },
        });
        expect(await outboxOf(COUPLE_ID)).toEqual([
            expect.objectContaining({
                eventName: PhotoPromptDrawnEvent.EVENT_NAME,
                coupleId: COUPLE_ID,
                userId: BY_THE_APP,
                version: 1,
                published: false,
                eventData: null,
            }),
        ]);
    });

    it('issues it once at its time, the same for both partners', async () => {
        messaging.clock.setNow(TEN_AM);
        await messaging.tick();
        messaging.clock.advanceBy(60_000);
        await messaging.tick();
        const { id } = await promptOf(COUPLE_ID);
        const issued = {
            id,
            issuedAt: TEN_AM.toISOString(),
            lateFrom: '2026-11-24T09:10:00.000Z',
            closesAt: MIDNIGHT.toISOString(),
            myInstantPhotoId: null,
            isAnsweredByPartner: false,
        };
        const responses = await Promise.all(
            [PARTNER_A, PARTNER_B].map((userId) =>
                messaging.todayPhotoPrompt(userId),
            ),
        );
        expect(responses).toEqual([
            { status: 200, body: { photoPrompt: issued } },
            { status: 200, body: { photoPrompt: issued } },
        ]);
        expect(
            (await outboxOf(COUPLE_ID)).map(({ eventName, version }) => ({
                eventName,
                version,
            })),
        ).toEqual([
            { eventName: PhotoPromptDrawnEvent.EVENT_NAME, version: 1 },
            { eventName: PhotoPromptIssuedEvent.EVENT_NAME, version: 2 },
        ]);
    });

    it('gives each couple its own prompt only (core.md rule 27)', async () => {
        messaging.clock.setNow(TEN_AM);
        await messaging.tick();
        const ours = todayPhotoPromptOf(
            await messaging.todayPhotoPrompt(PARTNER_A),
        );
        const theirs = todayPhotoPromptOf(
            await messaging.todayPhotoPrompt(STRANGER),
        );
        expect(theirs.photoPrompt?.id).toBe(
            (await promptOf(OTHER_COUPLE_ID)).id,
        );
        expect(theirs.photoPrompt?.id).not.toBe(ours.photoPrompt?.id);
    });

    it('answers 404 to a partner without a formed couple, 401 without a session (R4)', async () => {
        expect(await messaging.todayPhotoPrompt(ALONE)).toEqual(
            refusal(
                404,
                MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED,
                'The messages need a formed couple',
            ),
        );
        expect(
            (
                await messaging
                    .unauthenticated()
                    .get(ApiRouterEnum.PHOTO_PROMPT_TODAY_GET)
            ).status,
        ).toBe(401);
    });
});
