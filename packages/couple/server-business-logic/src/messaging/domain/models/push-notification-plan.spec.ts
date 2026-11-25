import {
    CalendarEventVisibilityEnum,
    NoteVisibilityEnum,
    PushNotificationKindEnum,
} from '@cocooning/couple-shared-kernel/enums';
import {
    CalendarEventCreatedEvent,
    CalendarEventEditedEvent,
    CalendarEventSharedEvent,
} from '../../../agenda/domain/events';
import {
    NoteCreatedEvent,
    NoteRenamedEvent,
    NoteSharedEvent,
} from '../../../notes/domain/events';
import {
    AS_A,
    COUPLE_ID,
    PARTNER_A,
} from '../../__tests__/fixtures/messaging-test.data';
import { outboxEventOf } from '../../__tests__/fixtures/messaging-test.push-data';
import { pushNotificationsOf } from './push-notification-plan';

const toPartnerOfA = (kind: string) => [
    { coupleId: COUPLE_ID, kind, excludedPartnerId: PARTNER_A },
];
const created = (visibility: string) => ({ ownerId: PARTNER_A, visibility });
const notificationsOf = (eventName: string, data: unknown) =>
    pushNotificationsOf([outboxEventOf(1, eventName, AS_A, data)]);

describe('Feature: what the notes and the agenda notify', () => {
    describe('Scenario: agenda R10, an event that becomes visible to the other', () => {
        it.each([
            [
                'created shared',
                CalendarEventCreatedEvent.EVENT_NAME,
                created(CalendarEventVisibilityEnum.SHARED),
            ],
            ['shared later', CalendarEventSharedEvent.EVENT_NAME, null],
        ])(
            'rings the other partner for an event %s',
            (_label, eventName, data) => {
                expect(notificationsOf(eventName, data)).toEqual(
                    toPartnerOfA(PushNotificationKindEnum.CALENDAR_EVENT_ADDED),
                );
            },
        );
    });

    describe('Scenario: notes R9, a note that becomes visible to the other', () => {
        it.each([
            [
                'created shared',
                NoteCreatedEvent.EVENT_NAME,
                created(NoteVisibilityEnum.SHARED),
            ],
            ['shared later', NoteSharedEvent.EVENT_NAME, null],
        ])(
            'rings the other partner for a note %s',
            (_label, eventName, data) => {
                expect(notificationsOf(eventName, data)).toEqual(
                    toPartnerOfA(PushNotificationKindEnum.NOTE_SHARED),
                );
            },
        );
    });

    describe('Scenario: what stays private or changes nothing for the other', () => {
        it.each([
            [
                'a private calendar event',
                CalendarEventCreatedEvent.EVENT_NAME,
                created(CalendarEventVisibilityEnum.PRIVATE),
            ],
            [
                'a private note',
                NoteCreatedEvent.EVENT_NAME,
                created(NoteVisibilityEnum.PRIVATE),
            ],
            [
                'an edited calendar event',
                CalendarEventEditedEvent.EVENT_NAME,
                null,
            ],
            ['a renamed note', NoteRenamedEvent.EVENT_NAME, null],
            ['a created note without data', NoteCreatedEvent.EVENT_NAME, null],
            [
                'a created note with text data',
                NoteCreatedEvent.EVENT_NAME,
                'SHARED',
            ],
            [
                'a created note without visibility',
                NoteCreatedEvent.EVENT_NAME,
                { ownerId: PARTNER_A },
            ],
        ])('notifies nobody for %s', (_label, eventName, data) => {
            expect(notificationsOf(eventName, data)).toEqual([]);
        });
    });
});
