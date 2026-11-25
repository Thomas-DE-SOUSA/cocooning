import { PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { pushSubscriptionInvalid } from './push-subscription-invalid';

type PushEndpointProps = {
    readonly value: string;
};

const HTTPS_ADDRESS = /^https:\/\/\S+$/;

// R11: the address of a phone's push service; a secret of the phone, never logged (core.md rule 30).
export class PushEndpoint extends ValueObject<PushEndpointProps> {
    private constructor(props: PushEndpointProps) {
        super(props);
        Object.freeze(this);
    }

    static create(raw: string): PushEndpoint {
        if (
            !HTTPS_ADDRESS.test(raw) ||
            raw.length > PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH
        ) {
            throw pushSubscriptionInvalid(
                PUSH_SUBSCRIPTION_ENDPOINT_MAX_LENGTH,
            );
        }
        return new PushEndpoint({ value: raw });
    }

    static from(value: string): PushEndpoint {
        return new PushEndpoint({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
