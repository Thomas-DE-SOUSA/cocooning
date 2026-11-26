'use client';

import { Field, FieldError, Input, Label } from '@cocooning/design-system';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';

type Props = {
    readonly idPrefix: string;
    readonly title: UseFormRegisterReturn;
    readonly titleError: string | null;
    readonly emoji: UseFormRegisterReturn;
    readonly emojiError: string | null;
};

// R8, R26: the title of a list and its optional emoji, typed with the phone's emoji keyboard.
export function ListDetailsFields({
    idPrefix,
    title,
    titleError,
    emoji,
    emojiError,
}: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    const ids = {
        title: `${idPrefix}-title`,
        titleError: `${idPrefix}-title-error`,
        emoji: `${idPrefix}-emoji`,
        emojiError: `${idPrefix}-emoji-error`,
    };
    return (
        <>
            <Field>
                <Label htmlFor={ids.title}>{t('form.listTitle.label')}</Label>
                <Input
                    id={ids.title}
                    autoComplete="off"
                    enterKeyHint="next"
                    aria-invalid={titleError !== null}
                    aria-describedby={ids.titleError}
                    {...title}
                />
                <FieldError id={ids.titleError}>{titleError}</FieldError>
            </Field>
            <Field>
                <Label htmlFor={ids.emoji}>{t('form.listEmoji.label')}</Label>
                <Input
                    id={ids.emoji}
                    autoComplete="off"
                    enterKeyHint="done"
                    className="w-24 text-center text-2xl"
                    aria-invalid={emojiError !== null}
                    aria-describedby={ids.emojiError}
                    {...emoji}
                />
                <FieldError id={ids.emojiError}>{emojiError}</FieldError>
            </Field>
        </>
    );
}
