'use client';

import type { ChangeEvent, RefObject } from 'react';
import type { CapturedPhoto } from '../../view-models/message-command.view-model';
import {
    type PhotoPromptCard,
    PhotoPromptCardStatusEnum,
} from '../../view-models/photo-prompt-card.view-model';
import { PhotoPreviewView } from '../views/photo-preview.view';

type Props = {
    readonly inputRef: RefObject<HTMLInputElement | null>;
    readonly photo: CapturedPhoto | null;
    readonly promptCard: PhotoPromptCard | null;
    readonly isSending: boolean;
    readonly onChoose: (event: ChangeEvent<HTMLInputElement>) => void;
    readonly onDiscard: () => void;
    readonly onRetake: () => void;
    readonly onSend: (photo: CapturedPhoto) => void;
};

const issuedAtOf = (photo: CapturedPhoto, card: PhotoPromptCard | null) =>
    photo.photoPromptId !== null &&
    card?.status === PhotoPromptCardStatusEnum.OPEN
        ? card.issuedAt
        : null;

// R3: the file input opens the phone camera (any declared type: the API reads the bytes), then the preview.
export function PhotoCaptureContainer({
    inputRef,
    photo,
    promptCard,
    isSending,
    onChoose,
    onDiscard,
    onRetake,
    onSend,
}: Props) {
    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                tabIndex={-1}
                aria-hidden
                className="sr-only"
                onChange={onChoose}
            />
            {photo === null ? null : (
                <PhotoPreviewView
                    previewUrl={photo.previewUrl}
                    promptIssuedAt={issuedAtOf(photo, promptCard)}
                    isSending={isSending}
                    onCancel={onDiscard}
                    onRetake={onRetake}
                    onSend={() => onSend(photo)}
                />
            )}
        </>
    );
}
