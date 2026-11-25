import {
    type PushDeliveryOutcome,
    PushDeliveryOutcomeEnum,
} from '@cocooning/couple-server-business-logic/messaging';
import { WebPushError } from 'web-push';

// RFC 8030: the push service no longer knows the subscription (expired, or the phone unsubscribed).
const GONE_STATUSES: ReadonlyArray<number> = [404, 410];

export const statusCodeOf = (error: unknown): number | null =>
    error instanceof WebPushError ? error.statusCode : null;

// R11: only a gone subscription is forgotten; any other failure (timeout, 429, 5xx) keeps it.
export function pushDeliveryOutcomeOf(error: unknown): PushDeliveryOutcome {
    const statusCode = statusCodeOf(error);
    if (statusCode !== null && GONE_STATUSES.includes(statusCode)) {
        return PushDeliveryOutcomeEnum.GONE;
    }
    return PushDeliveryOutcomeEnum.FAILED;
}
