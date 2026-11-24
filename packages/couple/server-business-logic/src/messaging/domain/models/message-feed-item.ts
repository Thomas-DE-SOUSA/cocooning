import type { CursorPage } from '@cocooning/shared-kernel/domain';
import type { FlashMessage } from './flash-message.aggregate';
import type { InstantPhoto } from './instant-photo.aggregate';

// R5: what the feed holds, newest first.
export type MessageFeedItem = FlashMessage | InstantPhoto;

export type MessageFeedPage = CursorPage<MessageFeedItem>;
