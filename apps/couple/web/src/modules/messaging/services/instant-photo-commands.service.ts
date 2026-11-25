import 'server-only';
import type {
    AnswerPhotoPromptUseCase,
    InstantPhotoUpload,
    SendInstantPhotoUseCase,
} from '@cocooning/couple-client-business-logic/messaging';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { PhotoPromptParamsRequestSchema } from '@cocooning/couple-contract/messaging';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import { presentInstantPhotoRefusalKey } from '../presenters/instant-photo-check.presenter';
import { invalidInput } from './message-commands.service';

// core-frontend.md rule 14, R3: the size is checked again on the server; the API reads the format in the bytes.
export async function toInstantPhotoUpload(
    photo: unknown,
): Promise<Result<InstantPhotoUpload, ApiError>> {
    if (!(photo instanceof File)) return fail(invalidInput('Missing photo'));
    if (presentInstantPhotoRefusalKey(photo.size) !== null) {
        return fail(invalidInput('Invalid photo size'));
    }
    return ok({
        bytes: new Uint8Array(await photo.arrayBuffer()),
        contentType: photo.type,
        fileName: photo.name,
    });
}

// R1, R3: a spontaneous photo of the phone camera.
export async function sendInstantPhoto(
    photo: unknown,
    useCase: SendInstantPhotoUseCase,
): Promise<Result<null, ApiError>> {
    const upload = await toInstantPhotoUpload(photo);
    if (!upload.success) return upload;
    const sent = await useCase.execute(upload.value);
    return sent.success ? ok(null) : sent;
}

// R8: the photo of the day, sent to today's prompt.
export async function answerPhotoPrompt(
    photoPromptIdInput: unknown,
    photo: unknown,
    useCase: AnswerPhotoPromptUseCase,
): Promise<Result<null, ApiError>> {
    const params = PhotoPromptParamsRequestSchema.safeParse({
        photoPromptId: photoPromptIdInput,
    });
    if (!params.success) return fail(invalidInput('Invalid photo prompt id'));
    const upload = await toInstantPhotoUpload(photo);
    if (!upload.success) return upload;
    const sent = await useCase.execute(params.data.photoPromptId, upload.value);
    return sent.success ? ok(null) : sent;
}
