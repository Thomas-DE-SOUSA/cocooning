import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type FolderKind,
    FolderKindEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteException } from '../exceptions/note.exception';
import type { FolderPlace } from '../models/folder.aggregate.type';
import type { SmartFolderSettings } from '../models/smart-folder-settings';

export class SmartFolderValidator {
    // R18: inside a smart folder, the subject and the template are those of the tree, never a folder's own.
    static ensureTemplateAllowedUnder(parent: FolderPlace | null): void {
        if (parent === null || parent.kind !== FolderKindEnum.SMART) return;
        throw new NoteException({
            code: NoteExceptionCodeEnum.FOLDER_TEMPLATE_INHERITED,
            message: 'A folder inside a smart folder inherits its template',
        });
    }

    // R17, R18: a smart folder brings its settings, a classic one none; inside a smart folder, it is smart.
    static kindOf(
        requested: FolderKind,
        parent: FolderPlace | null,
        settings: SmartFolderSettings | null,
    ): FolderKind {
        if (parent !== null && parent.kind === FolderKindEnum.SMART) {
            if (settings !== null)
                SmartFolderValidator.ensureTemplateAllowedUnder(parent);
            return FolderKindEnum.SMART;
        }
        if (requested === FolderKindEnum.SMART && settings === null) {
            throw new NoteException({
                code: NoteExceptionCodeEnum.CARD_TEMPLATE_INVALID,
                message: 'A smart folder needs a subject and a card template',
            });
        }
        if (requested === FolderKindEnum.CLASSIC && settings !== null) {
            throw new NoteException({
                code: NoteExceptionCodeEnum.FOLDER_NOT_SMART,
                message: 'A classic folder has no subject nor template',
            });
        }
        return requested;
    }

    // R18: a smart sub-folder reads its template from the top of the tree, which alone edits it.
    static ensureHoldsTemplate(settings: SmartFolderSettings | null): void {
        if (settings !== null) return;
        throw new NoteException({
            code: NoteExceptionCodeEnum.FOLDER_NOT_SMART,
            message: 'This folder holds no card template',
        });
    }
}
