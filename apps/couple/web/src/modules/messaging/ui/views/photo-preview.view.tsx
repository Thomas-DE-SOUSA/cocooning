'use client';

import { Button, Spinner } from '@cocooning/design-system';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';

type Props = {
    readonly previewUrl: string;
    readonly promptIssuedAt: string | null;
    readonly isSending: boolean;
    readonly onCancel: () => void;
    readonly onRetake: () => void;
    readonly onSend: () => void;
};

const TITLE_ID = 'photo-preview-title';
const PREVIEW_SIZE = 1080;

// R3: the photo taken, full screen, before it leaves: take it again or send it; a photo of the day says its prompt (R8).
export function PhotoPreviewView(props: Props) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
            className="fixed inset-0 z-50 flex flex-col gap-4 bg-background px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
            <div className="mx-auto grid w-full max-w-lg grid-cols-[1fr_auto_1fr] items-center">
                <Button
                    variant="ghost"
                    className="justify-self-start px-2 text-muted-foreground"
                    disabled={props.isSending}
                    onClick={props.onCancel}
                >
                    {t('preview.cancel')}
                </Button>
                <h2
                    id={TITLE_ID}
                    className="text-xl font-semibold"
                >
                    {t('preview.title')}
                </h2>
            </div>
            <Image
                src={props.previewUrl}
                alt={t('preview.alt')}
                width={PREVIEW_SIZE}
                height={PREVIEW_SIZE}
                unoptimized
                className="mx-auto min-h-0 w-full max-w-lg flex-1 rounded-3xl bg-muted object-contain"
            />
            {props.promptIssuedAt === null ? null : (
                <p className="text-center text-sm text-muted-foreground">
                    {t('preview.promptCaption', { time: props.promptIssuedAt })}
                </p>
            )}
            <div className="mx-auto flex w-full max-w-lg gap-3">
                <Button
                    variant="outline"
                    className="h-12 flex-1 text-base"
                    disabled={props.isSending}
                    onClick={props.onRetake}
                >
                    {t('preview.retake')}
                </Button>
                <Button
                    className="h-12 flex-1 text-base"
                    disabled={props.isSending}
                    aria-busy={props.isSending}
                    onClick={props.onSend}
                >
                    {props.isSending ? (
                        <Spinner aria-label={t('preview.sending')} />
                    ) : (
                        t('preview.send')
                    )}
                </Button>
            </div>
        </div>
    );
}
