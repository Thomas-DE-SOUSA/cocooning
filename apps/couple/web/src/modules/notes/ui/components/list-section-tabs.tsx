'use client';

import { cn } from '@cocooning/design-system';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import type { NoteListsSectionTab } from '../../view-models/note-lists-screen.view-model';

type Props = { readonly tabs: readonly NoteListsSectionTab[] };

// Courses, Tâches, Envies: the current section is filled in the accent, not only coloured (decision 0058).
export function ListSectionTabs({ tabs }: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    return (
        <nav
            aria-label={t('sections.label')}
            className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-card p-1"
        >
            {tabs.map((tab) => (
                <Link
                    key={tab.section}
                    href={tab.href}
                    replace
                    aria-current={tab.isCurrent ? 'page' : false}
                    className={cn(
                        'flex h-11 items-center justify-center rounded-lg text-base',
                        tab.isCurrent
                            ? 'bg-primary font-bold text-primary-foreground'
                            : 'font-medium text-foreground',
                    )}
                >
                    {t(`sections.${tab.section}`)}
                </Link>
            ))}
        </nav>
    );
}
