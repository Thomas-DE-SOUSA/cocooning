import { resolveRoute } from '@cocooning/client-infrastructure/shared/http';
import type { MessageFeedItemResponse } from '@cocooning/couple-contract/messaging';
import { MessageFeedItemTypeEnum } from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    type MessageFeedDay,
    type MessageFeedEntry,
    MessageFeedEntryKindEnum,
} from '../view-models/message-feed.view-model';
import { presentFeedDayHeading } from './feed-day-heading.presenter';
import { presentParisDay, presentParisTime } from './paris-time.presenter';

const SAME_ORIGIN = '';

// R5, R9: a hidden photo of the day gets no address, so that the browser never asks for its bytes.
export function toMessageFeedEntry(
    item: MessageFeedItemResponse,
): MessageFeedEntry {
    const base = {
        id: item.id,
        isOwner: item.isOwner,
        time: presentParisTime(item.sentAt),
    };
    if (item.type === MessageFeedItemTypeEnum.FLASH_MESSAGE) {
        return {
            ...base,
            kind: MessageFeedEntryKindEnum.FLASH_MESSAGE,
            text: item.text,
        };
    }
    if (item.isHidden) {
        return { ...base, kind: MessageFeedEntryKindEnum.HIDDEN_PHOTO };
    }
    return {
        ...base,
        kind: MessageFeedEntryKindEnum.INSTANT_PHOTO,
        src: resolveRoute(SAME_ORIGIN, WebRouterEnum.INSTANT_PHOTO_FILE, {
            instantPhotoId: item.id,
        }),
        isPhotoOfTheDay: item.photoPromptId !== null,
        isLate: item.isLate,
    };
}

const withoutRepeats = (items: readonly MessageFeedItemResponse[]) =>
    items.filter(
        (item, index) => items.findIndex(({ id }) => id === item.id) === index,
    );

// R5: oldest first like a chat, grouped by Paris day; the items arrive newest first, page after page.
export function presentMessageFeedDays(
    items: readonly MessageFeedItemResponse[],
    today: string,
): MessageFeedDay[] {
    const days: MessageFeedDay[] = [];
    for (const item of withoutRepeats(items).reverse()) {
        const day = presentParisDay(new Date(item.sentAt));
        const last = days.at(-1);
        if (last?.day === day) {
            days[days.length - 1] = {
                ...last,
                entries: [...last.entries, toMessageFeedEntry(item)],
            };
            continue;
        }
        days.push({
            day,
            heading: presentFeedDayHeading(day, today),
            entries: [toMessageFeedEntry(item)],
        });
    }
    return days;
}
