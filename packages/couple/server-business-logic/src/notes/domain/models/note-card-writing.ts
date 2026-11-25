import type { NoteCardWritingKindEnum } from '../enums/note-card-writing-kind.enum';
import type { CardFieldValues } from './card-fields';
import type { CardCandidate } from './note-card.aggregate.type';
import type { Place } from './place';

// One result of the search engine (decision 0054).
export type WebSearchResult = {
    readonly title: string;
    readonly url: string;
    readonly snippet: string;
};

// The text read on one page of the results, bounded by the reader.
export type WebPageText = {
    readonly url: string;
    readonly text: string;
};

// What was found for one card: the place of OpenStreetMap, when there is one (decision 0055), then the web.
export type NoteCardFindings = {
    readonly place: Place | null;
    readonly results: ReadonlyArray<WebSearchResult>;
    readonly pages: ReadonlyArray<WebPageText>;
};

// R24: all that leaves for the AI: the subject, the names of the folders, the fields to fill, what the couple
// typed and the texts found. Never the free notes of the couple.
export type NoteCardWritingRequest = NoteCardFindings & {
    readonly subject: string;
    readonly folderNames: ReadonlyArray<string>;
    readonly fieldNames: ReadonlyArray<string>;
    readonly query: string;
};

export type NoteCardWriting =
    | {
          readonly kind: typeof NoteCardWritingKindEnum.CANDIDATES;
          readonly candidates: ReadonlyArray<CardCandidate>;
      }
    | {
          readonly kind: typeof NoteCardWritingKindEnum.VALUES;
          readonly values: CardFieldValues;
          readonly sourceUrls: ReadonlyArray<string>;
      };
