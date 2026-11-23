'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { pairingModule } from '../services/pairing-module.factory';

export async function pairingInvitationCodeRenewAction(): Promise<
    Result<null, ApiError>
> {
    const couple = await pairingModule().renewInvitationCode.execute();
    return couple.success ? ok(null) : couple;
}
