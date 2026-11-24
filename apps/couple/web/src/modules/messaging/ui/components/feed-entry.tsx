'use client';

import { cn } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';
import type { MessageFeedEntry } from '../../view-models/message-feed.view-model';
import { FeedEntryContent } from './feed-entry-content';
import { FeedEntryMeta } from './feed-entry-meta';

type Props = {
    readonly entry: MessageFeedEntry;
    readonly onSelect: (entry: MessageFeedEntry) => void;
};

// R6: only my own entries are buttons, which open the withdrawal sheet; the partner's are not tappable.
export function FeedEntry({ entry, onSelect }: Props) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    return (
        <li
            className={cn(
                'flex max-w-[80%] flex-col gap-1',
                entry.isOwner ? 'items-end self-end' : 'items-start self-start',
            )}
        >
            {entry.isOwner ? (
                <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => onSelect(entry)}
                    className="rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                    <FeedEntryContent entry={entry} />
                    <span className="sr-only">{t('item.withdrawHint')}</span>
                </button>
            ) : (
                <FeedEntryContent entry={entry} />
            )}
            <FeedEntryMeta entry={entry} />
        </li>
    );
}
