'use client';

import type { FlashMessageForm } from '@cocooning/couple-client-business-logic/messaging';
import { Button, FieldError, Input, Spinner } from '@cocooning/design-system';
import { ArrowUp, Camera } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';
import { READY_WORD_KEYS } from '../../data/ready-word-keys';
import type { FlashMessageFormInput } from '../../view-models/flash-message-form.view-model';

type Props = {
    readonly form: UseFormReturn<
        FlashMessageFormInput,
        unknown,
        FlashMessageForm
    >;
    readonly isSending: boolean;
    readonly isBusy: boolean;
    readonly onSubmit: (form: FlashMessageForm) => void;
    readonly onReadyWord: (text: string) => void;
    readonly onTakePhoto: () => void;
};

const TEXT_ERROR_ID = 'flash-message-text-error';
const ROUND = 'size-11 shrink-0 rounded-full px-0';

// Above the tab bar: ready-made words sent in one tap (R2), the camera (R3), a typed word and its send button.
export function MessageComposerView(props: Props) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    const { errors } = props.form.formState;
    return (
        <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 border-t border-border bg-background">
            <div className="mx-auto flex max-w-lg flex-col gap-2 px-3 py-2">
                <ul
                    aria-label={t('composer.readyWords')}
                    className="flex gap-2 overflow-x-auto"
                >
                    {READY_WORD_KEYS.map((key) => (
                        <li key={key}>
                            <Button
                                variant="outline"
                                className="rounded-full px-3 font-medium whitespace-nowrap text-foreground"
                                disabled={props.isBusy}
                                onClick={() => props.onReadyWord(t(key))}
                            >
                                {t(key)}
                            </Button>
                        </li>
                    ))}
                </ul>
                <form
                    method="post"
                    noValidate
                    onSubmit={props.form.handleSubmit(props.onSubmit)}
                    className="flex items-start gap-2"
                >
                    <Button
                        variant="secondary"
                        className={ROUND}
                        aria-label={t('composer.takePhoto')}
                        disabled={props.isBusy}
                        onClick={props.onTakePhoto}
                    >
                        <Camera
                            aria-hidden
                            className="size-5"
                        />
                    </Button>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <Input
                            aria-label={t('form.text.label')}
                            placeholder={t('form.text.placeholder')}
                            autoComplete="off"
                            enterKeyHint="send"
                            className="h-11 rounded-full"
                            aria-invalid={Boolean(errors.text)}
                            aria-describedby={TEXT_ERROR_ID}
                            {...props.form.register('text')}
                        />
                        <FieldError id={TEXT_ERROR_ID}>
                            {errors.text?.message}
                        </FieldError>
                    </div>
                    <Button
                        type="submit"
                        className={ROUND}
                        aria-label={t('composer.send')}
                        disabled={props.isBusy}
                        aria-busy={props.isSending}
                    >
                        {props.isSending ? (
                            <Spinner aria-label={t('composer.sending')} />
                        ) : (
                            <ArrowUp
                                aria-hidden
                                className="size-5"
                            />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
