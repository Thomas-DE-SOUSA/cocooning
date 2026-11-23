import { SESSION_COOKIE_NAME } from '@cocooning/couple-contract/authentication';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS: readonly string[] = [
    WebRouterEnum.ACCOUNT_SIGN_IN,
    WebRouterEnum.OFFLINE,
];

// An optimistic check of the cookie only: the API session guard verifies the token on every call (decision 0034).
export function proxy(request: NextRequest): NextResponse {
    if (PUBLIC_PATHS.includes(request.nextUrl.pathname)) {
        return NextResponse.next();
    }
    if (request.cookies.has(SESSION_COOKIE_NAME)) {
        return NextResponse.next();
    }
    return NextResponse.redirect(
        new URL(WebRouterEnum.ACCOUNT_SIGN_IN, request.url),
    );
}

// Literal patterns, since Next analyses the matcher at build time. The files of the PWA are fetched without the session cookie.
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|sw\\.js|swe-worker-.*|manifest\\.webmanifest|icons/|apple-icon\\.png|favicon\\.ico).*)',
    ],
};
