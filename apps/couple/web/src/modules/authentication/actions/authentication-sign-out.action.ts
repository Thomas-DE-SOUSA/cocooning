'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { cookies } from 'next/headers';
import { authenticationModule } from '../services/authentication-module.factory';
import { closeSignOutSession } from '../services/sign-out-session.service';

export async function authenticationSignOutAction(): Promise<
    Result<null, ApiError>
> {
    return closeSignOutSession(authenticationModule().signOut, cookies);
}
