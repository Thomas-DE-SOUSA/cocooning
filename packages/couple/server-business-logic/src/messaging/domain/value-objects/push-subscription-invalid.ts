import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { MessagingException } from '../exceptions/messaging.exception';

export const pushSubscriptionInvalid = (max: number): MessagingException =>
    new MessagingException({
        code: MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_INVALID,
        message: 'Invalid push subscription',
        context: { min: 1, max },
    });
