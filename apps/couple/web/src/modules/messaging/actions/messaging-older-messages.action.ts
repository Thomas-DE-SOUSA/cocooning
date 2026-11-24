'use server';

import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { MessageFeedPageResponse } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import { messagingModule } from '../services/messaging-module.factory';
import { listOlderMessages } from '../services/older-messages.service';

// R5: the older pages are read on demand; the first one comes from the server page (decision 0036).
export async function messagingOlderMessagesAction(
    cursor: string,
): Promise<Result<MessageFeedPageResponse, ApiError>> {
    return listOlderMessages(cursor, messagingModule().listMessageFeed);
}
