'use client';

import { Button, Spinner } from '@cocooning/design-system';
import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';
import {
    type FeedDayHeading,
    FeedDayKindEnum,
    type MessageFeedDay,
    type MessageFeedEntry,
} from '../../view-models/message-feed.view-model';
import { FeedEntry } from '../components/feed-entry';

type Props = {
    readonly days: readonly MessageFeedDay[];
    readonly hasOlder: boolean;
    readonly isLoadingOlder: boolean;
    readonly onLoadOlder: () => void;
    readonly onSelectEntry: (entry: MessageFeedEntry) => void;
    readonly latestRef: RefObject<HTMLDivElement | null>;
};

const HEADING_KEYS = {
    [FeedDayKindEnum.TODAY]: 'feed.today',
    [FeedDayKindEnum.YESTERDAY]: 'feed.yesterday',
} as const;

// R5: the feed, oldest first like a chat and grouped by Paris day; older pages on demand, at the top.
export function MessageFeedView({ latestRef, ...props }: Props) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    const headingOf = (heading: FeedDayHeading) =>
        heading.kind === FeedDayKindEnum.DATE
            ? heading.label
            : t(HEADING_KEYS[heading.kind]);
    if (props.days.length === 0) {
        return (
            <p className="py-8 text-center text-muted-foreground">
                {t('feed.empty')}
            </p>
        );
    }
    return (
        <section
            aria-label={t('feed.label')}
            className="flex flex-col gap-4"
        >
            {props.hasOlder ? (
                <Button
                    variant="ghost"
                    className="self-center"
                    disabled={props.isLoadingOlder}
                    aria-busy={props.isLoadingOlder}
                    onClick={props.onLoadOlder}
                >
                    {props.isLoadingOlder ? (
                        <Spinner aria-label={t('feed.loadingOlder')} />
                    ) : (
                        t('feed.older')
                    )}
                </Button>
            ) : null}
            {props.days.map((day) => (
                <section
                    key={day.day}
                    className="flex flex-col gap-2"
                >
                    <h2 className="text-center font-sans text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {headingOf(day.heading)}
                    </h2>
                    <ul className="flex flex-col gap-3">
                        {day.entries.map((entry) => (
                            <FeedEntry
                                key={entry.id}
                                entry={entry}
                                onSelect={props.onSelectEntry}
                            />
                        ))}
                    </ul>
                </section>
            ))}
            <div
                ref={latestRef}
                aria-hidden
            />
        </section>
    );
}
