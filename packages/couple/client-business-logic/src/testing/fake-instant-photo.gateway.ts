import type { MessageFeedItemResponse } from '@cocooning/couple-contract/messaging';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { InstantPhotoFile } from '../messaging/domain/models/instant-photo-file';
import type { InstantPhotoUpload } from '../messaging/domain/models/instant-photo-upload';
import { InstantPhotoGateway } from '../messaging/domain/ports/instant-photo.gateway';
import type { ApiError } from '../shared/api-error';
import { AN_INSTANT_PHOTO, AN_INSTANT_PHOTO_FILE } from './messaging-fixtures';

export type InstantPhotoGatewayCall =
    | {
          readonly operation: 'sendInstantPhoto';
          readonly photo: InstantPhotoUpload;
      }
    | {
          readonly operation: 'withdrawInstantPhoto' | 'getInstantPhotoFile';
          readonly instantPhotoId: string;
      };

// One photo and one file answer every call, or one refusal does.
export class FakeInstantPhotoGateway extends InstantPhotoGateway {
    readonly calls: InstantPhotoGatewayCall[] = [];
    private refusal: ApiError | null = null;

    givenRefusal(error: ApiError): void {
        this.refusal = error;
    }

    override sendInstantPhoto(
        photo: InstantPhotoUpload,
    ): Promise<Result<MessageFeedItemResponse, ApiError>> {
        return this.respond(
            { operation: 'sendInstantPhoto', photo },
            AN_INSTANT_PHOTO,
        );
    }

    override withdrawInstantPhoto(
        instantPhotoId: string,
    ): Promise<Result<null, ApiError>> {
        return this.respond(
            { operation: 'withdrawInstantPhoto', instantPhotoId },
            null,
        );
    }

    override getInstantPhotoFile(
        instantPhotoId: string,
    ): Promise<Result<InstantPhotoFile, ApiError>> {
        return this.respond(
            { operation: 'getInstantPhotoFile', instantPhotoId },
            AN_INSTANT_PHOTO_FILE,
        );
    }

    private respond<T>(
        call: InstantPhotoGatewayCall,
        value: T,
    ): Promise<Result<T, ApiError>> {
        this.calls.push(call);
        return Promise.resolve(
            this.refusal === null ? ok(value) : fail(this.refusal),
        );
    }
}
