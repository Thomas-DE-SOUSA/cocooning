import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type {
    MessageFeedPageResponse,
    TodayPhotoPromptResponse,
} from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import {
    type MessagesPage,
    MessagesStepEnum,
} from '../view-models/message-feed.view-model';
import { presentMessagesRefusal } from './messages-refusal.presenter';
import { presentParisDay } from './paris-time.presenter';
import { presentPhotoPromptCard } from './photo-prompt-card.presenter';

export type MessagesPageInput = {
    readonly feed: Result<MessageFeedPageResponse, ApiError>;
    readonly prompt: Result<TodayPhotoPromptResponse, ApiError>;
    readonly now: Date;
};

// The first page of the feed and today's prompt, read by the server page (decision 0036).
export function presentMessagesPage({
    feed,
    prompt,
    now,
}: MessagesPageInput): MessagesPage {
    if (!feed.success) return presentMessagesRefusal(feed.error);
    if (!prompt.success) return presentMessagesRefusal(prompt.error);
    return {
        redirectTo: null,
        viewModel: {
            step: MessagesStepEnum.FEED,
            today: presentParisDay(now),
            firstPage: feed.value,
            promptCard: presentPhotoPromptCard(prompt.value, now),
        },
    };
}
