import 'server-only';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import type { Result } from '@cocooning/shared-kernel/utils';
import { pairingModule } from '../actions/pairing-module.factory';

// Read by the pages (Server Components) with the session cookie of the request (decision 0036).
export function loadMyCouple(): Promise<
    Result<CoupleResponse | null, ApiError>
> {
    return pairingModule().getMyCouple.execute();
}
