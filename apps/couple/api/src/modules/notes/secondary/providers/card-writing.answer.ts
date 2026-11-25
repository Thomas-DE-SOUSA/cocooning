import {
    type CardFieldValues,
    type NoteCardWriting,
    NoteCardWritingKindEnum,
    type NoteCardWritingRequest,
} from '@cocooning/couple-server-business-logic/notes';
import type { CardWritingAnswer } from './card-writing.prompt';

// R21: only the fields asked for, and only the sources that were given: an address the AI made up is dropped.
const valuesOf = (
    answer: Extract<CardWritingAnswer, { kind: 'VALUES' }>,
    request: NoteCardWritingRequest,
): CardFieldValues =>
    Object.fromEntries(
        answer.values
            .filter(({ field }) => request.fieldNames.includes(field))
            .map(({ field, value }) => [field, value]),
    );

const givenUrlsOf = (request: NoteCardWritingRequest): ReadonlySet<string> =>
    new Set([
        ...request.results.map(({ url }) => url),
        ...request.pages.map(({ url }) => url),
    ]);

export const toNoteCardWriting = (
    answer: CardWritingAnswer,
    request: NoteCardWritingRequest,
): NoteCardWriting => {
    if (answer.kind === NoteCardWritingKindEnum.CANDIDATES) {
        return { kind: answer.kind, candidates: answer.candidates };
    }
    const given = givenUrlsOf(request);
    return {
        kind: answer.kind,
        values: valuesOf(answer, request),
        sourceUrls: [...new Set(answer.sourceUrls)].filter((url) =>
            given.has(url),
        ),
    };
};
