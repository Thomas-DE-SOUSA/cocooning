'use client';

import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { Card, cn } from '@cocooning/design-system';
import { ChevronRight, Lock, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { NOTES_NAMESPACE } from '../../data/notes-i18n-namespaces';
import type { NoteSpaceCard } from '../../view-models/notes-screen.view-model';

type Props = { readonly card: NoteSpaceCard };

// R10: « Partagé » in sage for both partners, « Privé » in terracotta for oneself, each with what it holds.
export function SpaceCard({ card }: Props) {
    const { t } = useTranslation(NOTES_NAMESPACE);
    const isShared = card.space === NoteSpaceEnum.SHARED;
    const Icon = isShared ? Users : Lock;
    const contents = t('spaces.contents', {
        folders: t('spaces.folderCount', { count: card.folderCount }),
        notes: t('spaces.noteCount', { count: card.noteCount }),
    });
    return (
        <li>
            <Card className="relative flex items-center gap-3.5 px-4 py-4.5">
                <span
                    className={cn(
                        'flex size-12 shrink-0 items-center justify-center rounded-xl',
                        isShared
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-primary/15 text-primary',
                    )}
                >
                    <Icon
                        aria-hidden="true"
                        className="size-6"
                    />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h2 className="text-xl font-semibold">
                        <Link
                            href={card.href}
                            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
                        >
                            {t(`spaces.${card.space}.name`)}
                        </Link>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {`${t(`spaces.${card.space}.subtitle`)} · ${contents}`}
                    </p>
                </div>
                <ChevronRight
                    aria-hidden="true"
                    className="size-5 text-muted-foreground"
                />
            </Card>
        </li>
    );
}
