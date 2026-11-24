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

// R8: a photo of the day names its photo prompt and tells whether it came late; a spontaneous photo has neither.
const InstantPhotoBaseSchema = MessageFeedItemBaseSchema.extend({
    type: z.literal(MessageFeedItemTypeEnum.INSTANT_PHOTO),
    photoPromptId: z.string().nullable(),
    isLate: z.boolean(),
});

// R9: the partner's photo of the day stays hidden until the reader sends theirs: no content type, and its file answers 404.
const InstantPhotoItemSchema = z.discriminatedUnion('isHidden', [
    InstantPhotoBaseSchema.extend({
        isHidden: z.literal(false),
        contentType: z.enum(Object.values(InstantPhotoContentTypeEnum)),
    }),
    InstantPhotoBaseSchema.extend({ isHidden: z.literal(true) }),
]);

// R5: one item of the feed, a flash message with its text or an instant photo, whose bytes come from INSTANT_PHOTO_FILE_GET.
export const MessageFeedItemResponseSchema = z.discriminatedUnion('type', [
    MessageFeedItemBaseSchema.extend({
        type: z.literal(MessageFeedItemTypeEnum.FLASH_MESSAGE),
        text: z.string(),
    }),
    InstantPhotoItemSchema,
]);

export type MessageFeedItemResponse = z.infer<
    typeof MessageFeedItemResponseSchema
>;
