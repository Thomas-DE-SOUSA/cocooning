import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { InstantPhoto } from '../../domain/models/instant-photo.aggregate';
import { PhotoPrompt } from '../../domain/models/photo-prompt.aggregate';
import { InstantPhotoContent } from '../../domain/value-objects/instant-photo-content.vo';
import { JPEG_PHOTO, TEN_AM_MINUTE, TODAY } from './messaging-test.data';
import { MessagingTestFakes } from './messaging-test.fakes';

// The given steps of the photo of the day: prompts and answers stored without their events.
export class MessagingPromptFakes extends MessagingTestFakes {
    // Today's prompt of the couple, drawn at 10:00 Paris; issued now when asked.
    givenPhotoPromptOf(
        coupleId: string,
        issued = true,
        day = TODAY,
    ): PhotoPrompt {
        this.secureRandomGenerator.willReturnIntegers([TEN_AM_MINUTE]);
        const photoPrompt = PhotoPrompt.draw(
            { coupleId, day },
            this.secureRandomGenerator,
            this.dateTimeProvider.now(),
        );
        if (issued) photoPrompt.issueIfDue(this.dateTimeProvider.now());
        photoPrompt.clearDomainEvents();
        this.photoPromptRepository.seed(photoPrompt);
        return photoPrompt;
    }

    // A photo of the day of a partner, stored with its file, without events.
    async givenPhotoOfTheDayOf(
        context: ExecutionContext,
        photoPrompt: PhotoPrompt,
    ): Promise<InstantPhoto> {
        const content = InstantPhotoContent.create(JPEG_PHOTO);
        const instantPhoto = InstantPhoto.answer(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                contentType: content.contentType,
            },
            photoPrompt.answerAt(this.dateTimeProvider.now()),
            this.dateTimeProvider.now(),
        );
        instantPhoto.clearDomainEvents();
        this.instantPhotoRepository.seed(instantPhoto);
        await this.fileStorage.store({
            key: instantPhoto.fileKey,
            content: JPEG_PHOTO,
            contentType: content.contentType,
        });
        return instantPhoto;
    }
}
