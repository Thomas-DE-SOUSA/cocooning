import type { NoteSpaceCounts } from '@cocooning/couple-server-business-logic/notes';
import {
    type NoteSpace,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';

export type GroupedCountRow<TKey> = {
    readonly key: TKey;
    readonly count: number;
};

// A space absent from a GROUP BY holds nothing the partner sees.
export function toNoteSpaceCounts(
    rows: ReadonlyArray<GroupedCountRow<NoteSpace>>,
): NoteSpaceCounts {
    const countOf = (space: NoteSpace): number =>
        rows.find(({ key }) => key === space)?.count ?? 0;
    return {
        [NoteSpaceEnum.SHARED]: countOf(NoteSpaceEnum.SHARED),
        [NoteSpaceEnum.PRIVATE]: countOf(NoteSpaceEnum.PRIVATE),
    };
}

export function toCountsByFolder(
    rows: ReadonlyArray<GroupedCountRow<string | null>>,
): ReadonlyMap<string, number> {
    return new Map(
        rows.flatMap(({ key, count }): [string, number][] =>
            key === null ? [] : [[key, count]],
        ),
    );
}
