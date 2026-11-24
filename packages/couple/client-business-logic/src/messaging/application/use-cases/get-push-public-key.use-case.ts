import type { PushPublicKeyResponse } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { ApiError } from '../../../shared/api-error';
import type { PushSubscriptionGateway } from '../../domain/ports/push-subscription.gateway';

// R11: the VAPID public key the phone subscribes with; the PWA keeps no copy of it.
export class GetPushPublicKeyUseCase {
    constructor(
        private readonly pushSubscriptionGateway: PushSubscriptionGateway,
    ) {}

    execute(): Promise<Result<PushPublicKeyResponse, ApiError>> {
        return this.pushSubscriptionGateway.getPushPublicKey();
    }
}
