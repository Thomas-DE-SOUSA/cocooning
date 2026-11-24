import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { InstantPhotoPreconditionService } from '../../domain/services/instant-photo-precondition.service';
import {
    type InstantPhotoFileView,
    toInstantPhotoFileView,
} from '../mappers/instant-photo-file-view.mapper';

export type GetInstantPhotoFileCommand = {
    readonly instantPhotoId: string;
};

export class GetInstantPhotoFileUseCase {
    constructor(
        private readonly instantPhotoPreconditionService: InstantPhotoPreconditionService,
    ) {}

    // The bytes of a live photo of the couple only: another couple, a withdrawn photo (R6) and the partner's photo of
    // the day not answered yet (R9) answer not found.
    async execute(
        context: ExecutionContext,
        command: GetInstantPhotoFileCommand,
    ): Promise<InstantPhotoFileView> {
        const instantPhoto =
            await this.instantPhotoPreconditionService.loadInstantPhoto(
                context,
                command.instantPhotoId,
            );
        await this.instantPhotoPreconditionService.ensureVisibleTo(
            context,
            instantPhoto,
        );
        const file =
            await this.instantPhotoPreconditionService.loadFileOf(instantPhoto);
        return toInstantPhotoFileView(instantPhoto, file);
    }
}
