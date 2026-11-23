'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { pairingModule } from '../services/pairing-module.factory';

// The page reads the couple again after router.refresh(): the action only says whether it worked (decision 0036).
export async function pairingCoupleCreateAction(): Promise<
    Result<null, ApiError>
> {
    const couple = await pairingModule().createCouple.execute();
    return couple.success ? ok(null) : couple;
}
