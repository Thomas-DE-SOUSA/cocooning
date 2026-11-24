import {
    InstantPhotoContentTypeEnum,
    MessageFeedItemTypeEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

const MessageFeedItemBaseSchema = z.object({
    id: z.string(),
    ownerId: z.string(),
    isOwner: z.boolean(),
    sentAt: z.string(),
});

// R5: one item of the feed, a flash message with its text or an instant photo, whose bytes come from INSTANT_PHOTO_FILE_GET.
export const MessageFeedItemResponseSchema = z.discriminatedUnion('type', [
    MessageFeedItemBaseSchema.extend({
        type: z.literal(MessageFeedItemTypeEnum.FLASH_MESSAGE),
        text: z.string(),
    }),
    MessageFeedItemBaseSchema.extend({
        type: z.literal(MessageFeedItemTypeEnum.INSTANT_PHOTO),
        contentType: z.enum(Object.values(InstantPhotoContentTypeEnum)),
    }),
]);

export type MessageFeedItemResponse = z.infer<
    typeof MessageFeedItemResponseSchema
>;
