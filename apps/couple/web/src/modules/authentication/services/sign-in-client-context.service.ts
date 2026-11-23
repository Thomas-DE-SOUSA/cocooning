import type { SignInClientContext } from '@cocooning/couple-client-business-logic/authentication';

// core-frontend.md rule 13: the first x-forwarded-for entry is the browser, the next ones are the proxies in front of Next.
export function readSignInClientContext(headers: Headers): SignInClientContext {
    const forwardedFor = headers.get('x-forwarded-for');
    const ipAddress = forwardedFor?.split(',')[0]?.trim() ?? '';
    return {
        ipAddress: ipAddress === '' ? null : ipAddress,
        userAgent: headers.get('user-agent'),
    };
}
