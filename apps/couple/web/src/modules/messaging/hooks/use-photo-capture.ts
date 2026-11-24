import { type ChangeEvent, useCallback, useRef, useState } from 'react';
import { presentInstantPhotoRefusalKey } from '../presenters/instant-photo-check.presenter';
import type { CapturedPhoto } from '../view-models/message-command.view-model';

// R3: the camera opens through a file input, then the photo waits in the preview; only its size is checked here.
export function usePhotoCapture(onRefused: (refusalKey: string) => void) {
    const inputRef = useRef<HTMLInputElement>(null);
    const promptIdRef = useRef<string | null>(null);
    const [captured, setCaptured] = useState<CapturedPhoto | null>(null);
    const openCamera = useCallback((photoPromptId: string | null) => {
        promptIdRef.current = photoPromptId;
        inputRef.current?.click();
    }, []);
    const choosePhoto = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.currentTarget.files?.item(0) ?? null;
            event.currentTarget.value = '';
            if (file === null) return;
            const refusalKey = presentInstantPhotoRefusalKey(file.size);
            if (refusalKey !== null) {
                onRefused(refusalKey);
                return;
            }
            setCaptured({
                file,
                previewUrl: URL.createObjectURL(file),
                photoPromptId: promptIdRef.current,
            });
        },
        [onRefused],
    );
    const discard = useCallback(() => {
        if (captured !== null) URL.revokeObjectURL(captured.previewUrl);
        setCaptured(null);
    }, [captured]);
    const retake = useCallback(() => {
        const photoPromptId = captured?.photoPromptId ?? null;
        discard();
        openCamera(photoPromptId);
    }, [captured, discard, openCamera]);
    return { inputRef, captured, openCamera, choosePhoto, discard, retake };
}
