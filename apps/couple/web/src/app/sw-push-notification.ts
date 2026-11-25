import {
    type PushNotificationKind,
    PushNotificationKindEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import generic from '../i18n/locales/fr/generic.json';
import push from '../i18n/locales/fr/messaging/push.json';

export type PushNotificationDisplay = {
    readonly title: string;
    readonly body: string;
    readonly tag: string;
    readonly url: string;
};

// The icon of the manifest (src/app/manifest.ts); a badge needs a monochrome icon, which the PWA does not have yet.
export const PUSH_NOTIFICATION_ICON = '/icons/icon-192.png';

const SCREEN_OF_KIND: Readonly<Record<PushNotificationKind, string>> = {
    MESSAGE_RECEIVED: WebRouterEnum.MESSAGES,
    PHOTO_PROMPT_ISSUED: WebRouterEnum.MESSAGES,
    CALENDAR_EVENT_ADDED: WebRouterEnum.AGENDA,
    NOTE_SHARED: WebRouterEnum.HOME,
};

const GENERIC_TAG = 'GENERIC';

const KINDS: readonly string[] = Object.values(PushNotificationKindEnum);

const isKind = (value: unknown): value is PushNotificationKind =>
    typeof value === 'string' && KINDS.includes(value);

function kindOf(payload: string | null): PushNotificationKind | null {
    if (payload === null) return null;
    try {
        const parsed: unknown = JSON.parse(payload);
        if (typeof parsed !== 'object' || parsed === null) return null;
        return 'kind' in parsed && isKind(parsed.kind) ? parsed.kind : null;
    } catch {
        // Unreadable JSON: the push still shows the generic notification, as userVisibleOnly requires.
        return null;
    }
}

// Decision 0051: the payload is { kind } alone, the French sentence and the screen to open are the PWA's (R10).
export function pushNotificationOf(
    payload: string | null,
): PushNotificationDisplay {
    const kind = kindOf(payload);
    if (kind === null) {
        return {
            title: generic.app.name,
            body: push.notification.generic,
            tag: GENERIC_TAG,
            url: WebRouterEnum.HOME,
        };
    }
    return {
        title: generic.app.name,
        body: push.notification[kind],
        tag: kind,
        url: SCREEN_OF_KIND[kind],
    };
}

const SCREENS: readonly string[] = Object.values(SCREEN_OF_KIND);

const isScreen = (value: unknown): value is string =>
    typeof value === 'string' && SCREENS.includes(value);

// The data of a shown notification comes back on the tap; anything but one of our screens opens the home screen.
export function notificationUrlOf(data: unknown): string {
    if (typeof data !== 'object' || data === null) return WebRouterEnum.HOME;
    return 'url' in data && isScreen(data.url) ? data.url : WebRouterEnum.HOME;
}
