import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { MessageFeedPageResponse } from '@cocooning/couple-contract/messaging';
import type { PhotoPromptCard } from './photo-prompt-card.view-model';

export const MessageFeedEntryKindEnum = {
    FLASH_MESSAGE: 'FLASH_MESSAGE',
    INSTANT_PHOTO: 'INSTANT_PHOTO',
    HIDDEN_PHOTO: 'HIDDEN_PHOTO',
} as const;

type EntryBase = {
    readonly id: string;
    readonly isOwner: boolean;
    readonly time: string;
};

// A visible photo carries the address of the photo route; a hidden photo of the day has none (R9).
export type MessageFeedEntry =
    | (EntryBase & {
          readonly kind: typeof MessageFeedEntryKindEnum.FLASH_MESSAGE;
          readonly text: string;
      })
    | (EntryBase & {
          readonly kind: typeof MessageFeedEntryKindEnum.INSTANT_PHOTO;
          readonly src: string;
          readonly isPhotoOfTheDay: boolean;
          readonly isLate: boolean;
      })
    | (EntryBase & {
          readonly kind: typeof MessageFeedEntryKindEnum.HIDDEN_PHOTO;
      });

export const FeedDayKindEnum = {
    TODAY: 'TODAY',
    YESTERDAY: 'YESTERDAY',
    DATE: 'DATE',
} as const;

export type FeedDayHeading =
    | {
          readonly kind:
              typeof FeedDayKindEnum.TODAY | typeof FeedDayKindEnum.YESTERDAY;
      }
    | { readonly kind: typeof FeedDayKindEnum.DATE; readonly label: string };

export type MessageFeedDay = {
    readonly day: string;
    readonly heading: FeedDayHeading;
    readonly entries: readonly MessageFeedEntry[];
};

export const MessagesStepEnum = {
    FEED: 'FEED',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type MessagesScreenViewModel =
    | {
          readonly step: typeof MessagesStepEnum.FEED;
          readonly today: string;
          // Raw items, presented in the browser together with the older pages it reads.
          readonly firstPage: MessageFeedPageResponse;
          readonly promptCard: PhotoPromptCard | null;
      }
    | {
          readonly step: typeof MessagesStepEnum.UNAVAILABLE;
          readonly error: ApiError;
      };

export type MessagesFeedScreen = Extract<
    MessagesScreenViewModel,
    { readonly step: typeof MessagesStepEnum.FEED }
>;

export type MessagesPage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | {
          readonly redirectTo: null;
          readonly viewModel: MessagesScreenViewModel;
      };
