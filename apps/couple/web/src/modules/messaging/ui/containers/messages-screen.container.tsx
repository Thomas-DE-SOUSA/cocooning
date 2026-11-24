'use client';

import { toast } from '@cocooning/design-system';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';
import { messageCommandGateway } from '../../gateways';
import { useFlashMessageForm } from '../../hooks/use-flash-message-form';
import { useMessageCommands } from '../../hooks/use-message-commands';
import { useMessageFeedback } from '../../hooks/use-message-feedback';
import { usePhotoCapture } from '../../hooks/use-photo-capture';
import {
    type MessageCommand,
    MessageCommandEnum,
} from '../../view-models/message-command.view-model';
import type { MessagesFeedScreen } from '../../view-models/message-feed.view-model';
import { MessageComposerView } from '../views/message-composer.view';
import { PhotoPromptCardView } from '../views/photo-prompt-card.view';
import { MessageFeedContainer } from './message-feed.container';
import { PhotoCaptureContainer } from './photo-capture.container';

// The page keys the feed by the cursor of its first page: a shifted first page drops the older pages read before.
export function MessagesScreenContainer({
    viewModel,
}: {
    readonly viewModel: MessagesFeedScreen;
}) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    const form = useFlashMessageForm();
    const refusePhoto = useCallback(
        (refusalKey: string) =>
            toast.error(t('toast.photoRefused'), {
                description: t(refusalKey),
            }),
        [t],
    );
    const capture = usePhotoCapture(refusePhoto);
    const { reset } = form;
    const { discard } = capture;
    const settle = useCallback(
        (command: MessageCommand) => {
            if (command === MessageCommandEnum.SEND_FLASH_MESSAGE) reset();
            if (command === MessageCommandEnum.SEND_INSTANT_PHOTO) discard();
        },
        [reset, discard],
    );
    const commands = useMessageCommands({
        gateway: messageCommandGateway,
        ...useMessageFeedback(settle),
    });
    const { firstPage, promptCard } = viewModel;
    return (
        <>
            {promptCard === null ? null : (
                <PhotoPromptCardView
                    card={promptCard}
                    isBusy={commands.isBusy}
                    onTakePhoto={capture.openCamera}
                />
            )}
            <MessageFeedContainer
                key={firstPage.nextCursor ?? 'last-page'}
                firstPage={firstPage}
                today={viewModel.today}
            />
            <MessageComposerView
                form={form}
                isSending={
                    commands.pending === MessageCommandEnum.SEND_FLASH_MESSAGE
                }
                isBusy={commands.isBusy}
                onSubmit={commands.sendFlashMessage}
                onReadyWord={commands.sendReadyWord}
                onTakePhoto={() => capture.openCamera(null)}
            />
            <PhotoCaptureContainer
                inputRef={capture.inputRef}
                photo={capture.captured}
                promptCard={promptCard}
                isSending={
                    commands.pending === MessageCommandEnum.SEND_INSTANT_PHOTO
                }
                onChoose={capture.choosePhoto}
                onDiscard={capture.discard}
                onRetake={capture.retake}
                onSend={commands.sendPhoto}
            />
        </>
    );
}
