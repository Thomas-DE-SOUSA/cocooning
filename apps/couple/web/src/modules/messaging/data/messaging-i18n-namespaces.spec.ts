import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import { MESSAGE_DONE_KEYS, MESSAGE_FAILURE_KEYS } from './message-toast-keys';
import {
    MESSAGING_NAMESPACE,
    MESSAGING_SCREEN_ERROR_CODES,
} from './messaging-i18n-namespaces';
import { READY_WORD_KEYS } from './ready-word-keys';

const REQUIRED_KEYS = [
    'title',
    ...['label', 'today', 'yesterday', 'empty', 'older', 'loadingOlder'].map(
        (key) => `feed.${key}`,
    ),
    ...[
        'photoAltMine',
        'photoAltPartner',
        'photoOfTheDay',
        'late',
        'hidden',
        'withdrawHint',
    ].map((key) => `item.${key}`),
    ...READY_WORD_KEYS,
    'composer.readyWords',
    'composer.takePhoto',
    'composer.send',
    'composer.sending',
    'form.text.label',
    'form.text.placeholder',
    'form.text.errors.required',
    'form.text.errors.tooLong',
    'form.photo.errors.required',
    'form.photo.errors.tooHeavy',
    ...[
        'title',
        'alt',
        'promptCaption',
        'cancel',
        'retake',
        'send',
        'sending',
    ].map((key) => `preview.${key}`),
    ...[
        'title',
        'issuedAt',
        'beforeLate',
        'late',
        'partnerAnswered',
        'partnerWaiting',
        'take',
        'answered',
        'bothAnswered',
    ].map((key) => `prompt.${key}`),
    ...['title', 'description', 'confirm', 'withdrawing', 'keep'].map(
        (key) => `withdraw.${key}`,
    ),
    ...Object.values(MESSAGE_DONE_KEYS),
    ...Object.values(MESSAGE_FAILURE_KEYS),
    'toast.olderFailed',
    'toast.photoRefused',
    'unavailable.title',
    'unavailable.refresh',
    ...[
        ...MESSAGING_SCREEN_ERROR_CODES,
        ...Object.values(ApiErrorCodeEnum),
    ].map((code) => `apiErrors.${code}`),
];

describe('Feature: messages of the messages screen (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has every key of the feed, the composer, the preview, the prompt and the server errors in %s',
        (locale) => {
            const keys = flattenLocale(
                RESOURCES[locale][MESSAGING_NAMESPACE],
            ).map(({ key }) => key);

            expect(REQUIRED_KEYS.filter((key) => !keys.includes(key))).toEqual(
                [],
            );
        },
    );

    it('leaves the push subscription codes to the notification toggle', () => {
        expect(
            MESSAGING_SCREEN_ERROR_CODES.filter((code) =>
                code.startsWith('PUSH_'),
            ),
        ).toEqual([]);
    });
});
