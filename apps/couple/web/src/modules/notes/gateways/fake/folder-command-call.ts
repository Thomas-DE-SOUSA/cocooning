import type {
    FolderNameForm,
    FolderTemplateForm,
    SmartFolderForm,
} from '@cocooning/couple-client-business-logic/notes';
import type { NoteLocation } from '../../view-models/note-place.view-model';

export type FolderCommandCall =
    | {
          readonly operation: 'createFolder';
          readonly form: FolderNameForm | SmartFolderForm;
          readonly destination: NoteLocation;
      }
    | {
          readonly operation: 'proposeFolderTemplate';
          readonly form: FolderNameForm;
          readonly destination: NoteLocation;
      }
    | {
          readonly operation: 'editFolderTemplate';
          readonly folderId: string;
          readonly form: FolderTemplateForm;
      }
    | {
          readonly operation: 'renameFolder';
          readonly folderId: string;
          readonly form: FolderNameForm;
      }
    | { readonly operation: 'deleteFolder'; readonly folderId: string }
    | {
          readonly operation: 'moveFolder';
          readonly folderId: string;
          readonly parentFolderId: string | null;
      };
