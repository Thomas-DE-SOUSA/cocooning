import type { NoteDetailResponse } from '@cocooning/couple-contract/notes';
import { I18N_CONFIG } from '@/i18n/config';
import type { NoteCardViewModel } from '../view-models/note-card.view-model';
import { presentNoteCardChoices } from './note-row-item.presenter';

const OPEN_STREET_MAP_PAGE = /^https:\/\/(www\.)?openstreetmap\.org\//;

const SEARCHED_ON_FORMAT = new Intl.DateTimeFormat(I18N_CONFIG.defaultLocale, {
    day: 'numeric',
    month: 'short',
    timeZone: I18N_CONFIG.timeZone,
});

// R20 to R22: the card of the page of a note; « Mettre à jour » only inside a smart folder (R25).
export function presentNoteCard(
    note: NoteDetailResponse,
    isInSmartFolder: boolean,
): NoteCardViewModel | null {
    const { card } = note;
    if (card === null) return null;
    return {
        noteId: card.noteId,
        status: card.status,
        fields: card.fields,
        choice: presentNoteCardChoices([note])[0] ?? null,
        sources: card.sources.map((url) => ({
            url,
            isOpenStreetMap: OPEN_STREET_MAP_PAGE.test(url),
        })),
        searchedOn:
            card.searchedAt === null
                ? null
                : SEARCHED_ON_FORMAT.format(new Date(card.searchedAt)),
        canRefresh: isInSmartFolder,
    };
}
