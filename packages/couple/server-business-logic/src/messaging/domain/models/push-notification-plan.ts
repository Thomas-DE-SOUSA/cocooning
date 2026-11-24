import {
    CalendarEventVisibilityEnum,
    NoteVisibilityEnum,
    type PushNotificationKind,
    PushNotificationKindEnum,
} from '@cocooning/couple-shared-kernel/enums';
import {
    CalendarEventCreatedEvent,
    CalendarEventSharedEvent,
} from '../../../agenda/domain/events';
import {
    NoteCreatedEvent,
    NoteSharedEvent,
} from '../../../notes/domain/events';
import { FlashMessageSentEvent } from '../events/flash-message-sent.event';
import { InstantPhotoSentEvent } from '../events/instant-photo-sent.event';
import { PhotoPromptIssuedEvent } from '../events/photo-prompt-issued.event';
import type { OutboxEvent } from './outbox-event';
import type { PushNotification } from './push-notification';

type NotificationRule = {
    readonly kind: PushNotificationKind;
    readonly toBoth: boolean;
    readonly notifies: (data: unknown) => boolean;
};

const always = (): boolean => true;

// A created note or calendar event notifies only when shared; unreadable data notifies nobody, it never blocks the relay.
const createdWith =
    (shared: string) =>
    (data: unknown): boolean =>
        typeof data === 'object' &&
        data !== null &&
        'visibility' in data &&
        data.visibility === shared;

const toPartner = (
    kind: PushNotificationKind,
    notifies: (data: unknown) => boolean = always,
): NotificationRule => ({ kind, toBoth: false, notifies });

// The explicit table of EVENT_NAME to notification (decision 0004): R10 of messaging, R10 of agenda, R9 of notes.
const RULES: ReadonlyMap<string, NotificationRule> = new Map([
    [
        FlashMessageSentEvent.EVENT_NAME,
        toPartner(PushNotificationKindEnum.MESSAGE_RECEIVED),
    ],
    [
        InstantPhotoSentEvent.EVENT_NAME,
        toPartner(PushNotificationKindEnum.MESSAGE_RECEIVED),
    ],
    [
        PhotoPromptIssuedEvent.EVENT_NAME,
        {
            kind: PushNotificationKindEnum.PHOTO_PROMPT_ISSUED,
            toBoth: true,
            notifies: always,
        },
    ],
    [
        CalendarEventCreatedEvent.EVENT_NAME,
        toPartner(
            PushNotificationKindEnum.CALENDAR_EVENT_ADDED,
            createdWith(CalendarEventVisibilityEnum.SHARED),
        ),
    ],
    [
        CalendarEventSharedEvent.EVENT_NAME,
        toPartner(PushNotificationKindEnum.CALENDAR_EVENT_ADDED),
    ],
    [
        NoteCreatedEvent.EVENT_NAME,
        toPartner(
            PushNotificationKindEnum.NOTE_SHARED,
            createdWith(NoteVisibilityEnum.SHARED),
        ),
    ],
    [
        NoteSharedEvent.EVENT_NAME,
        toPartner(PushNotificationKindEnum.NOTE_SHARED),
    ],
]);

const notificationOf = (event: OutboxEvent): PushNotification | null => {
    const rule = RULES.get(event.eventName) ?? null;
    if (rule === null || !rule.notifies(event.data)) return null;
    return {
        coupleId: event.coupleId,
        kind: rule.kind,
        excludedPartnerId: rule.toBoth ? null : event.userId,
    };
};

const keyOf = ({ coupleId, kind, excludedPartnerId }: PushNotification) =>
    `${coupleId}:${kind}:${excludedPartnerId ?? ''}`;

// The notifications of a batch of events, each once: five words sent in a row ring the other's phone once.
export function pushNotificationsOf(
    events: ReadonlyArray<OutboxEvent>,
): ReadonlyArray<PushNotification> {
    const notifications = events
        .map(notificationOf)
        .filter((notification) => notification !== null);
    return [...new Map(notifications.map((n) => [keyOf(n), n])).values()];
}
