import { PUSH_SUBSCRIPTION_KEY_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { pushSubscriptionInvalid } from './push-subscription-invalid';

type PushSubscriptionKeysProps = {
    readonly p256dh: string;
    readonly auth: string;
};

const BASE64URL = /^[A-Za-z0-9_-]+={0,2}$/;

const isKey = (raw: string): boolean =>
    BASE64URL.test(raw) && raw.length <= PUSH_SUBSCRIPTION_KEY_MAX_LENGTH;

// R11: the keys the push payload is encrypted with; secrets of the phone, never logged (core.md rule 30).
export class PushSubscriptionKeys extends ValueObject<PushSubscriptionKeysProps> {
    private constructor(props: PushSubscriptionKeysProps) {
        super(props);
        Object.freeze(this);
    }

    static create(raw: PushSubscriptionKeysProps): PushSubscriptionKeys {
        if (!isKey(raw.p256dh) || !isKey(raw.auth)) {
            throw pushSubscriptionInvalid(PUSH_SUBSCRIPTION_KEY_MAX_LENGTH);
        }
        return new PushSubscriptionKeys({ p256dh: raw.p256dh, auth: raw.auth });
    }

    static from(props: PushSubscriptionKeysProps): PushSubscriptionKeys {
        return new PushSubscriptionKeys({ ...props });
    }

    get p256dh(): string {
        return this.props.p256dh;
    }

    get auth(): string {
        return this.props.auth;
    }
}
