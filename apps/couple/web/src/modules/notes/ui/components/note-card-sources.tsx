import { Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_CARD_NAMESPACE } from '../../data/note-card-i18n-namespaces';
import type { NoteCardSource } from '../../view-models/note-card.view-model';

type Props = {
    readonly sources: readonly NoteCardSource[];
    readonly searchedOn: string;
};

// R21: the card keeps its sources and the day of its search; the links open in a new tab, folded by default.
// Decision 0055: the page of a place on OpenStreetMap shows its name, as the ODbL licence asks.
export function NoteCardSources({ sources, searchedOn }: Props) {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    return (
        <details className="text-sm text-muted-foreground">
            <summary className="flex cursor-pointer items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-ring">
                <Link2
                    aria-hidden="true"
                    className="size-4"
                />
                {t('card.sources', { count: sources.length, date: searchedOn })}
            </summary>
            <ul className="mt-2 flex flex-col gap-1.5">
                {sources.map((source) => (
                    <li key={source.url}>
                        <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-foreground underline underline-offset-2"
                        >
                            {source.isOpenStreetMap
                                ? t('card.openStreetMapSource')
                                : source.url}
                        </a>
                    </li>
                ))}
            </ul>
        </details>
    );
}
