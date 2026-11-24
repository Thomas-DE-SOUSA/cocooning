import { INSTANT_PHOTO_FORM_FIELD } from '@cocooning/couple-contract/messaging';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type {
    TestClient,
    TestFileResponse,
    TestResponse,
} from '../shared/app/test-client';
import { feedItemOf, JPEG_PHOTO, LOVE } from './messaging-test-data';

const withId = (route: string, name: string, id: string): string =>
    route.replace(`:${name}`, id);

// The photo as the PWA form sends it; the declared type is what a phone may say, never trusted (R3).
const photoForm = (
    bytes: Uint8Array,
    field: string,
    declaredType: string,
): FormData => {
    const form = new FormData();
    form.append(field, new Blob([bytes], { type: declaredType }), 'photo');
    return form;
};

// One method per route of the messages, sent as a partner signed in at the clock of the test app.
export abstract class MessagingRequests {
    abstract as(userId: string): TestClient;

    sendFlashMessage(userId: string, text = LOVE): Promise<TestResponse> {
        return this.as(userId).post(ApiRouterEnum.FLASH_MESSAGE_SEND, { text });
    }

    async sentFlashMessageId(userId: string, text = LOVE): Promise<string> {
        return feedItemOf(await this.sendFlashMessage(userId, text)).id;
    }

    sendInstantPhoto(
        userId: string,
        bytes: Uint8Array = JPEG_PHOTO,
        declaredType = 'image/jpeg',
        field = INSTANT_PHOTO_FORM_FIELD,
    ): Promise<TestResponse> {
        return this.as(userId).postForm(
            ApiRouterEnum.INSTANT_PHOTO_SEND,
            photoForm(bytes, field, declaredType),
        );
    }

    async sentInstantPhotoId(
        userId: string,
        bytes: Uint8Array = JPEG_PHOTO,
    ): Promise<string> {
        return feedItemOf(await this.sendInstantPhoto(userId, bytes)).id;
    }

    feed(
        userId: string,
        query: Record<string, string> = {},
    ): Promise<TestResponse> {
        const search = new URLSearchParams(query).toString();
        return this.as(userId).get(
            `${ApiRouterEnum.MESSAGE_FEED_GET}?${search}`,
        );
    }

    withdrawFlashMessage(userId: string, id: string): Promise<TestResponse> {
        return this.as(userId).delete(
            withId(ApiRouterEnum.FLASH_MESSAGE_WITHDRAW, 'flashMessageId', id),
        );
    }

    withdrawInstantPhoto(userId: string, id: string): Promise<TestResponse> {
        return this.as(userId).delete(
            withId(ApiRouterEnum.INSTANT_PHOTO_WITHDRAW, 'instantPhotoId', id),
        );
    }

    photoFilePath(id: string): string {
        return withId(
            ApiRouterEnum.INSTANT_PHOTO_FILE_GET,
            'instantPhotoId',
            id,
        );
    }

    photoFile(userId: string, id: string): Promise<TestFileResponse> {
        return this.as(userId).getFile(this.photoFilePath(id));
    }

    todayPhotoPrompt(userId: string): Promise<TestResponse> {
        return this.as(userId).get(ApiRouterEnum.PHOTO_PROMPT_TODAY_GET);
    }

    answerPhotoPrompt(
        userId: string,
        photoPromptId: string,
        bytes: Uint8Array = JPEG_PHOTO,
    ): Promise<TestResponse> {
        return this.as(userId).postForm(
            withId(
                ApiRouterEnum.PHOTO_PROMPT_ANSWER,
                'photoPromptId',
                photoPromptId,
            ),
            photoForm(bytes, INSTANT_PHOTO_FORM_FIELD, 'image/jpeg'),
        );
    }
}
