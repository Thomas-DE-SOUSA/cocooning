import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { NoteListEmoji } from './note-list-emoji.vo';

type NoteListProps = {
    readonly kind: NoteListKind;
    readonly emoji: NoteListEmoji | null;
};

export type NoteListSnapshot = {
    readonly listKind: NoteListKind | null;
    readonly emoji: string | null;
};

// R26: what makes a note a list of the Lists tab, its section and its optional emoji; an ordinary note has none.
export class NoteList extends ValueObject<NoteListProps> {
    private constructor(props: NoteListProps) {
        super(props);
        Object.freeze(this);
    }

    static create(kind: NoteListKind, emoji: NoteListEmoji | null): NoteList {
        return new NoteList({ kind, emoji });
    }

    static fromSnapshot({
        listKind,
        emoji,
    }: NoteListSnapshot): NoteList | null {
        if (listKind === null) return null;
        return new NoteList({
            kind: listKind,
            emoji: emoji === null ? null : NoteListEmoji.from(emoji),
        });
    }

    static snapshotOf(list: NoteList | null): NoteListSnapshot {
        if (list === null) return { listKind: null, emoji: null };
        return { listKind: list.kind, emoji: list.emojiValue };
    }

    withEmoji(emoji: NoteListEmoji | null): NoteList {
        return new NoteList({ kind: this.props.kind, emoji });
    }

    get kind(): NoteListKind {
        return this.props.kind;
    }

    get emojiValue(): string | null {
        const { emoji } = this.props;
        return emoji === null ? null : emoji.value;
    }
}
