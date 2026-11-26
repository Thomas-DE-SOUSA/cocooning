import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import type { NoteListCard } from '../../view-models/note-lists-screen.view-model';
import { NoteListCardRow } from './note-list-card';

type Props = {
    readonly title: string;
    readonly cards: readonly NoteListCard[];
    readonly kind: NoteListKind;
};

// « Communes » or « Rien que pour moi » (R28); an empty group is not shown.
export function NoteListsGroup({ title, cards, kind }: Props) {
    if (cards.length === 0) return null;
    return (
        <section className="flex flex-col gap-2">
            <h2 className="mx-1 text-sm font-bold tracking-wide text-muted-foreground uppercase">
                {title}
            </h2>
            <ul className="flex flex-col gap-2">
                {cards.map((card) => (
                    <NoteListCardRow
                        key={card.noteId}
                        card={card}
                        kind={kind}
                    />
                ))}
            </ul>
        </section>
    );
}
