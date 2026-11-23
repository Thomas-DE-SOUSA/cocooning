'use server';

import type { JoinCoupleForm } from '@cocooning/couple-client-business-logic/pairing';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { getServerTranslation } from '@/i18n/server';
import { PAIRING_NAMESPACE } from '../data/pairing-i18n-namespaces';
import { joinCouple } from '../services/join-couple.service';
import { pairingModule } from '../services/pairing-module.factory';

export async function pairingCoupleJoinAction(
    input: JoinCoupleForm,
): Promise<Result<null, ApiError>> {
    return joinCouple(input, {
        t: await getServerTranslation(PAIRING_NAMESPACE),
        joinCouple: pairingModule().joinCouple,
    });
}
