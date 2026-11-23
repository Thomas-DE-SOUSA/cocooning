'use server';

import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { cookies, headers } from 'next/headers';
import { serverEnv } from '@/env/server';
import { getServerTranslation } from '@/i18n/server';
import { SIGN_IN_NAMESPACE } from '../data/authentication-i18n-namespaces';
import { readSignInClientContext } from '../services/sign-in-client-context.service';
import { openSignInSession } from '../services/sign-in-session.service';
import { authenticationModule } from './authentication-module.factory';

// The session token stays on the server: the browser only receives the HttpOnly cookie (decision 0034).
export async function authenticationSignInAction(
    input: SignInForm,
): Promise<Result<null, ApiError>> {
    const session = await openSignInSession(input, {
        t: await getServerTranslation(SIGN_IN_NAMESPACE),
        signIn: authenticationModule.signIn,
        client: readSignInClientContext(await headers()),
        secure: serverEnv.NODE_ENV === 'production',
    });
    if (!session.success) return session;
    const { name, value, options } = session.value;
    (await cookies()).set(name, value, options);
    return ok(null);
}
