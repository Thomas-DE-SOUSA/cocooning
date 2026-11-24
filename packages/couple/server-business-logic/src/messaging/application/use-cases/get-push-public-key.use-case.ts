import {
    type PushPublicKeyView,
    toPushPublicKeyView,
} from '../mappers/push-public-key-view.mapper';

// R11: the VAPID public key the PWA subscribes with; configuration, the same for every partner, so no context.
export class GetPushPublicKeyUseCase {
    constructor(private readonly vapidPublicKey: string) {}

    execute(): PushPublicKeyView {
        return toPushPublicKeyView(this.vapidPublicKey);
    }
}
