import { CalendarEventResponseSchema } from '@cocooning/couple-contract/agenda';
import { NoteResponseSchema } from '@cocooning/couple-contract/notes';
import {
    CalendarEventVisibilityEnum,
    PushNotificationKindEnum,
} from '@cocooning/couple-shared-kernel/enums';
import {
    readAgendaEvents,
    readMessagingEvents,
    readNoteEvents,
    readPushSubscriptions,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PushDeliveryOutcomeEnum } from '@cocooning/couple-server-business-logic/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { MessagingTestApp } from './messaging-test-app';
import {
    COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    STRANGER,
} from './messaging-test-data';
import {
    PHONE_OF_A,
    PHONE_OF_B,
    PHONE_OF_STRANGER,
    TABLET_OF_B,
} from './push-test-data';

const push = (endpoint: string, ownerId: string, kind: string) => ({
    endpoint,
    ownerId,
    kind,
});
const calendarEvent = (visibility: string) => ({
    title: 'Dîner chez Lou',
    description: null,
    startsOn: '2026-11-28',
    endsOn: null,
    startsAt: null,
    endsAt: null,
    visibility,
});

describe('Feature: the outbox relay sends the notifications (R10, decision 0021)', () => {
    const messaging = new MessagingTestApp();

    beforeAll(() => messaging.start());
    afterAll(() => messaging.stop());
    beforeEach(async () => {
        await messaging.reset();
        await messaging.subscribe(PARTNER_A, PHONE_OF_A);
        await messaging.subscribe(PARTNER_B, PHONE_OF_B);
        await messaging.subscribe(PARTNER_B, TABLET_OF_B);
        await messaging.subscribe(STRANGER, PHONE_OF_STRANGER);
    });

    describe('Scenario: R10 of messaging, I send a word', () => {
        it('rings the phones of the other partner only, then marks the event published', async () => {
            const id = await messaging.sentFlashMessageId(PARTNER_A);
            await messaging.relay();
            const kind = PushNotificationKindEnum.MESSAGE_RECEIVED;
            expect(messaging.pushSender.sent).toEqual([
                push(PHONE_OF_B, PARTNER_B, kind),
                push(TABLET_OF_B, PARTNER_B, kind),
            ]);
            expect(await readMessagingEvents(messaging.prisma, id)).toEqual([
                expect.objectContaining({ published: true }),
            ]);
        });

        it('sends once when two relays run at once (FOR UPDATE SKIP LOCKED)', async () => {
            await messaging.sentFlashMessageId(PARTNER_A);
            await messaging.relayTwiceAtOnce();
            expect(messaging.pushSender.sent).toHaveLength(2);
        });

        it('never sends the same event twice', async () => {
            await messaging.sentFlashMessageId(PARTNER_A);
            await messaging.relay();
            await messaging.relay();
            expect(messaging.pushSender.sent).toHaveLength(2);
        });
    });

    describe('Scenario: R10 of messaging, the photo prompt is issued', () => {
        it('rings the phones of both partners of each couple', async () => {
            await messaging.issuedPhotoPromptId();
            await messaging.relay();
            const kind = PushNotificationKindEnum.PHOTO_PROMPT_ISSUED;
            expect(messaging.pushSender.sent).toEqual([
                push(PHONE_OF_A, PARTNER_A, kind),
                push(PHONE_OF_B, PARTNER_B, kind),
                push(TABLET_OF_B, PARTNER_B, kind),
                push(PHONE_OF_STRANGER, STRANGER, kind),
            ]);
        });
    });

    describe('Scenario: R10 of agenda, a calendar event', () => {
        const create = (visibility: string) =>
            messaging
                .as(PARTNER_B)
                .post(
                    ApiRouterEnum.CALENDAR_EVENT_CREATE,
                    calendarEvent(visibility),
                );

        const createdId = async (visibility: string) =>
            CalendarEventResponseSchema.parse((await create(visibility)).body)
                .calendarEventId;

        it('rings the other partner for a shared event', async () => {
            const id = await createdId(CalendarEventVisibilityEnum.SHARED);
            await messaging.relay();
            expect(messaging.pushSender.sent).toEqual([
                push(
                    PHONE_OF_A,
                    PARTNER_A,
                    PushNotificationKindEnum.CALENDAR_EVENT_ADDED,
                ),
            ]);
            expect(await readAgendaEvents(messaging.prisma, id)).toEqual([
                expect.objectContaining({ published: true }),
            ]);
        });

        it('rings nobody for an event "rien que pour moi", but marks it published', async () => {
            const id = await createdId(CalendarEventVisibilityEnum.PRIVATE);
            await messaging.relay();
            expect(messaging.pushSender.sent).toEqual([]);
            expect(await readAgendaEvents(messaging.prisma, id)).toEqual([
                expect.objectContaining({ published: true }),
            ]);
        });
    });

    describe('Scenario: R9 of notes, a note', () => {
        const toB = [
            push(PHONE_OF_B, PARTNER_B, PushNotificationKindEnum.NOTE_SHARED),
            push(TABLET_OF_B, PARTNER_B, PushNotificationKindEnum.NOTE_SHARED),
        ];
        const noteRoute = (route: string, id: string) =>
            route.replace(':noteId', id);

        it('rings the other partner for a note shared at creation (R2), never for one made private', async () => {
            const created = await messaging
                .as(PARTNER_A)
                .post(ApiRouterEnum.NOTE_CREATE, { title: 'Courses' });
            const id = NoteResponseSchema.parse(created.body).noteId;
            await messaging.relay();
            expect(messaging.pushSender.sent).toEqual(toB);
            await messaging
                .as(PARTNER_A)
                .post(noteRoute(ApiRouterEnum.NOTE_MAKE_PRIVATE, id));
            await messaging.relay();
            expect(messaging.pushSender.sent).toEqual(toB);
            await messaging
                .as(PARTNER_A)
                .post(noteRoute(ApiRouterEnum.NOTE_SHARE, id));
            await messaging.relay();
            expect(messaging.pushSender.sent).toEqual([...toB, ...toB]);
            expect(
                (await readNoteEvents(messaging.prisma, id)).map(
                    (e) => e.published,
                ),
            ).toEqual([true, true, true]);
        });
    });

    describe('Scenario: R11, the push service no longer knows a phone', () => {
        it('forgets the phone answered 410, keeps the others', async () => {
            messaging.pushSender.willAnswer(
                TABLET_OF_B,
                PushDeliveryOutcomeEnum.GONE,
            );
            await messaging.sentFlashMessageId(PARTNER_A);
            await messaging.relay();
            expect(
                (await readPushSubscriptions(messaging.prisma, COUPLE_ID)).map(
                    ({ endpoint }) => endpoint,
                ),
            ).toEqual([PHONE_OF_A, PHONE_OF_B]);
        });
    });
});
