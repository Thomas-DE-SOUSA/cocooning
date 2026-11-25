import type { FolderCommandGateway } from './folder-command.gateway';
import type { NoteCommandGateway } from './note-command.gateway';

// The gateways of the commands a sheet of the notes sends.
export type NoteSheetGateways = {
    readonly notes: NoteCommandGateway;
    readonly folders: FolderCommandGateway;
};
