import { notificationUrlOf, pushNotificationOf } from './sw-push-notification';

const GENERIC = {
    title: 'Cocooning',
    body: 'Cocooning a du nouveau',
    tag: 'GENERIC',
    url: '/',
};

describe('Feature: the service worker shows a discreet notification (R10, decision 0051)', () => {
    it.each([
        [
            'MESSAGE_RECEIVED',
            "Ton âme sœur t'a envoyé quelque chose",
            '/messages',
        ],
        ['PHOTO_PROMPT_ISSUED', "C'est l'heure de la photo", '/messages'],
        [
            'CALENDAR_EVENT_ADDED',
            'Ton âme sœur a ajouté un événement',
            '/agenda',
        ],
        ['NOTE_SHARED', 'Ton âme sœur a partagé une note avec toi', '/'],
    ])('says the sentence of %s and opens its screen', (kind, body, url) => {
        expect(pushNotificationOf(JSON.stringify({ kind }))).toEqual({
            title: 'Cocooning',
            body,
            tag: kind,
            url,
        });
    });

    it.each([
        ['no payload', null],
        ['an unreadable payload', '{kind'],
        ['an unknown kind', JSON.stringify({ kind: 'NOTE_DELETED' })],
        ['a payload without kind', JSON.stringify({ text: 'Bisous' })],
        ['a payload that is not an object', '"MESSAGE_RECEIVED"'],
    ])('still shows the generic notification for %s', (_label, payload) => {
        expect(pushNotificationOf(payload)).toEqual(GENERIC);
    });
});

describe('Feature: a tap on a notification opens its screen', () => {
    it.each([
        ['the screen it carries', { url: '/agenda' }, '/agenda'],
        ['the home screen without data', null, '/'],
        [
            'the home screen for another address',
            { url: 'https://evil.test' },
            '/',
        ],
        ['the home screen for data without url', { kind: 'NOTE_SHARED' }, '/'],
    ])('opens %s', (_label, data, url) => {
        expect(notificationUrlOf(data)).toBe(url);
    });
});
