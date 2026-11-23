'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { pairingModule } from '../services/pairing-module.factory';

// R8: no input to validate, the API reads the partner from the session.
export async function pairingCoupleCancelAction(): Promise<
    Result<null, ApiError>
> {
    return pairingModule().cancelCouple.execute();
}
