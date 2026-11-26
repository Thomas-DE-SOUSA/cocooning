import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import {
    type NoteListsSection,
    NoteListsSectionEnum,
    type NoteListsSectionTab,
} from '../view-models/note-lists-screen.view-model';
import { noteListsSectionHref } from './note-list-href.presenter';

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

const SECTIONS: readonly string[] = Object.values(NoteListsSectionEnum);

const isSection = (value: unknown): value is NoteListsSection =>
    typeof value === 'string' && SECTIONS.includes(value);

// /lists?section=: Courses when the section is missing or unknown, the first one of the tab.
export function presentNoteListsQuery(
    searchParams: SearchParams,
): NoteListsSection {
    const section = searchParams['section'];
    return isSection(section) ? section : NoteListsSectionEnum.GROCERIES;
}

export const presentNoteListsTabs = (
    current: NoteListsSection,
): readonly NoteListsSectionTab[] =>
    Object.values(NoteListsSectionEnum).map((section) => ({
        section,
        href: noteListsSectionHref(section),
        isCurrent: section === current,
    }));

// Envies reads no list yet (decision 0058, a later lot).
export const noteListKindOf = (
    section: NoteListsSection,
): NoteListKind | null =>
    section === NoteListsSectionEnum.WISHES ? null : section;
