import {
    CreateFolderUseCase,
    DeleteFolderUseCase,
    GetNoteSpaceContentsUseCase,
    ListNoteSpacesUseCase,
    MoveFolderUseCase,
    MoveNoteUseCase,
    RenameFolderUseCase,
} from '@cocooning/couple-server-business-logic/notes';
import { notesUseCase } from './notes-use-case.factory';

const folderMutation = <T>(
    token: new (
        ...args: ConstructorParameters<typeof RenameFolderUseCase>
    ) => T,
) =>
    notesUseCase(
        token,
        (d) =>
            new token(d.folders, d.folderPreconditions, d.clock, d.publishing),
    );

// The spaces and folders of decision 0052 (R10 to R16).
export const FOLDER_USE_CASES = [
    folderMutation(CreateFolderUseCase),
    folderMutation(RenameFolderUseCase),
    folderMutation(MoveFolderUseCase),
    notesUseCase(
        DeleteFolderUseCase,
        (d) =>
            new DeleteFolderUseCase(
                d.folders,
                d.folderPreconditions,
                d.unitOfWork,
                d.clock,
                d.publishing,
            ),
    ),
    notesUseCase(
        GetNoteSpaceContentsUseCase,
        (d) =>
            new GetNoteSpaceContentsUseCase(
                d.folders,
                d.repository,
                d.folderPreconditions,
            ),
    ),
    notesUseCase(
        ListNoteSpacesUseCase,
        (d) => new ListNoteSpacesUseCase(d.folders, d.repository),
    ),
    notesUseCase(
        MoveNoteUseCase,
        (d) =>
            new MoveNoteUseCase(
                d.repository,
                d.preconditions,
                d.folderPreconditions,
                d.revocation,
                d.clock,
                d.publishing,
            ),
    ),
];
