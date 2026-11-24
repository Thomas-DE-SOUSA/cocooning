import { violatedUniqueConstraint } from '@cocooning/couple-prisma/errors';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { MessagingException } from '@cocooning/couple-server-business-logic/messaging';

// Two saves read the same version: the second outbox row collides on (aggregate_id, version).
const EVENT_VERSION_CONSTRAINT = 'messaging_event_aggregate_id_version_key';

export const flashMessageVersionConflict = (): MessagingException =>
    new MessagingException({
        code: MessagingExceptionCodeEnum.FLASH_MESSAGE_VERSION_CONFLICT,
        message: 'Flash message changed since it was read',
    });

export const instantPhotoVersionConflict = (): MessagingException =>
    new MessagingException({
        code: MessagingExceptionCodeEnum.INSTANT_PHOTO_VERSION_CONFLICT,
        message: 'Instant photo changed since it was read',
    });

// The soft-delete extension hides a row withdrawn meanwhile, so a stale save tries to create it again and hits its primary key.
const toConflict = (
    error: unknown,
    primaryKey: string,
    conflict: () => MessagingException,
): MessagingException | null => {
    const constraint = violatedUniqueConstraint(error);
    if (constraint !== EVENT_VERSION_CONSTRAINT && constraint !== primaryKey)
        return null;
    return conflict();
};

export const photoPromptVersionConflict = (): MessagingException =>
    new MessagingException({
        code: MessagingExceptionCodeEnum.PHOTO_PROMPT_VERSION_CONFLICT,
        message: 'Photo prompt changed since it was read',
    });

export const toFlashMessageVersionConflict = (error: unknown) =>
    toConflict(error, 'flash_message_pkey', flashMessageVersionConflict);

export const toInstantPhotoVersionConflict = (error: unknown) =>
    toConflict(error, 'instant_photo_pkey', instantPhotoVersionConflict);

// R7: two ticks drawing the same day collide on (couple_id, day); the outbox key answers two issues of one prompt.
export const toPhotoPromptVersionConflict = (error: unknown) =>
    toConflict(
        error,
        'photo_prompt_couple_id_day_key',
        photoPromptVersionConflict,
    );

export const pushSubscriptionVersionConflict = (): MessagingException =>
    new MessagingException({
        code: MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_VERSION_CONFLICT,
        message: 'Push subscription changed since it was read',
    });

// R11: the same phone subscribing twice at once collides on (couple_id, endpoint); a subscription forgotten meanwhile, on its key.
export const toPushSubscriptionVersionConflict = (
    error: unknown,
): MessagingException | null => {
    const constraint = violatedUniqueConstraint(error);
    if (
        constraint !== 'push_subscription_couple_id_endpoint_key' &&
        constraint !== 'push_subscription_pkey'
    )
        return null;
    return pushSubscriptionVersionConflict();
};
