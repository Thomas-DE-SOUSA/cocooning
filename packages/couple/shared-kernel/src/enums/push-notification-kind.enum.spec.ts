import { PushNotificationKindEnum } from './push-notification-kind.enum';

describe('Feature: the kinds of push notification', () => {
    describe('Scenario: listing the kinds', () => {
        it('has a message, the photo prompt, a calendar event and a note, each value equal to its key', () => {
            expect(PushNotificationKindEnum).toEqual({
                MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
                PHOTO_PROMPT_ISSUED: 'PHOTO_PROMPT_ISSUED',
                CALENDAR_EVENT_ADDED: 'CALENDAR_EVENT_ADDED',
                NOTE_SHARED: 'NOTE_SHARED',
            });
        });
    });
});
