'use client';

import type { NoteCardQueryForm } from '@cocooning/couple-client-business-logic/notes';
import {
    Button,
    Card,
    Field,
    FieldError,
    Input,
    Label,
    Spinner,
} from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_CARD_NAMESPACE } from '../../data/note-card-i18n-namespaces';
import type { NoteCardChoice } from '../../view-models/note-card-choice.view-model';
import { CardCandidates } from '../components/card-candidates';
import { SubmitButton } from '../components/submit-button';

type Props = {
    readonly choice: NoteCardChoice;
    readonly form: UseFormReturn<NoteCardQueryForm>;
    readonly isRefining: boolean;
    readonly isChoosing: boolean;
    readonly isSearching: boolean;
    readonly isBusy: boolean;
    readonly onChoose: (index: number) => void;
    readonly onShowRefine: () => void;
    readonly onRefine: (form: NoteCardQueryForm) => void;
};

// R19: « Lequel ? », the candidates of a card in doubt; « Aucun de ceux-là » asks for a precision and searches again.
export function NoteCardChoiceView({
    choice,
    form,
    isRefining,
    isChoosing,
    isSearching,
    isBusy,
    onChoose,
    onShowRefine,
    onRefine,
}: Props) {
    const { t } = useTranslation(NOTE_CARD_NAMESPACE);
    const queryId = `note-card-query-${choice.noteId}`;
    const errorId = `${queryId}-error`;
    const { errors } = form.formState;
    return (
        <Card className="flex flex-col gap-3 p-4">
            <h2 className="flex items-center gap-2 font-sans text-base font-semibold break-words">
                {t('choice.title', { name: choice.title })}
                {isChoosing ? (
                    <Spinner aria-label={t('choice.choosing')} />
                ) : null}
            </h2>
            <CardCandidates
                candidates={choice.candidates}
                isBusy={isBusy}
                onChoose={onChoose}
            />
            {isRefining ? (
                <form
                    method="post"
                    noValidate
                    onSubmit={form.handleSubmit(onRefine)}
                    className="flex flex-col gap-3"
                >
                    <Field>
                        <Label htmlFor={queryId}>{t('form.query.label')}</Label>
                        <Input
                            id={queryId}
                            autoComplete="off"
                            enterKeyHint="search"
                            aria-invalid={Boolean(errors.query)}
                            aria-describedby={errorId}
                            {...form.register('query')}
                        />
                        <FieldError id={errorId}>
                            {errors.query?.message}
                        </FieldError>
                    </Field>
                    <SubmitButton
                        label={t('choice.search')}
                        pendingLabel={t('choice.searching')}
                        isPending={isSearching}
                        isBusy={isBusy}
                    />
                </form>
            ) : (
                <Button
                    variant="ghost"
                    disabled={isBusy}
                    onClick={onShowRefine}
                >
                    {t('choice.none')}
                </Button>
            )}
        </Card>
    );
}
