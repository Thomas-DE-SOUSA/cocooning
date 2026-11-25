import {
    NoteSpaceContentsQueryRequestSchema,
    NoteSpaceParamsRequestSchema,
} from '@cocooning/couple-contract/notes';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { NoteSpaceQuery } from '../view-models/note-space-screen.view-model';
import { presentNotePlace } from './note-place.presenter';

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

// /spaces/:space?folderId=: an unknown space goes back home, a folder id that is not one to the root of the space.
export function presentNoteSpaceQuery(
    spaceParam: string,
    searchParams: SearchParams,
): NoteSpaceQuery {
    const params = NoteSpaceParamsRequestSchema.safeParse({
        space: spaceParam,
    });
    if (!params.success) {
        return { redirectTo: WebRouterEnum.HOME, location: null };
    }
    const { space } = params.data;
    const query = NoteSpaceContentsQueryRequestSchema.safeParse({
        folderId: searchParams['folderId'],
    });
    if (!query.success) {
        return {
            redirectTo: presentNotePlace(space, null).href,
            location: null,
        };
    }
    return {
        redirectTo: null,
        location: { space, folderId: query.data.folderId },
    };
}
