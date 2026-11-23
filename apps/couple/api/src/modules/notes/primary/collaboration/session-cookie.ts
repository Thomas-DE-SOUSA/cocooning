import { SESSION_COOKIE_NAME } from '@cocooning/couple-contract/authentication';

const COOKIE_SEPARATOR = ';';
const PAIR_SEPARATOR = '=';

// The WebSocket handshake carries the session cookie of the PWA's origin (decision 0040); an empty token is refused by the use case.
export function readSessionCookie(cookieHeader: string | null): string {
    const pair = (cookieHeader ?? '')
        .split(COOKIE_SEPARATOR)
        .map((part) => part.trim())
        .find((part) =>
            part.startsWith(`${SESSION_COOKIE_NAME}${PAIR_SEPARATOR}`),
        );
    return pair === undefined
        ? ''
        : decodeURIComponent(pair.slice(SESSION_COOKIE_NAME.length + 1));
}
