import 'server-only';
import {
    type InstantPhotoFileAnswer,
    readInstantPhotoFile,
} from './instant-photo-file.service';
import { messagingModule } from './messaging-module.factory';

// Read by the photo route handler with the session cookie of the request: the browser never calls the API.
export function loadInstantPhotoFile(
    instantPhotoIdInput: unknown,
): Promise<InstantPhotoFileAnswer> {
    return readInstantPhotoFile(
        instantPhotoIdInput,
        messagingModule().getInstantPhotoFile,
    );
}
