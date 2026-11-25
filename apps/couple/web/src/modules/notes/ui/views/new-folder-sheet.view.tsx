'use client';

import type { SmartFolderForm } from '@cocooning/couple-client-business-logic/notes';
import {
    type FolderKind,
    FolderKindEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { Field, FieldError, Input, Label } from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CommandButton } from '@/shared/ui/command-button';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import type { CardTemplateEditor } from '../../view-models/card-template-editor.view-model';
import { CardTemplateFields } from '../components/card-template-fields';
import { FolderKindSwitch } from '../components/folder-kind-switch';
import { SheetHeading } from '../components/sheet-heading';
import { SubmitButton } from '../components/submit-button';

type Props = {
    readonly form: UseFormReturn<SmartFolderForm>;
    readonly description: string;
    readonly kind: FolderKind;
    readonly template: CardTemplateEditor;
    readonly isProposing: boolean;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onKindChange: (kind: FolderKind) => void;
    readonly onPropose: () => void;
    readonly onSubmit: (form: SmartFolderForm) => void;
};

const NAME_ID = 'new-folder-name';
const NAME_ERROR_ID = 'new-folder-name-error';

// R13, R17: a folder by its name, « Classique » or « IA »; for « IA », the AI proposes the subject and the fields from
// the name, and the couple corrects them before creating the folder.
export function NewFolderSheetView({
    form,
    description,
    kind,
    template,
    isProposing,
    isPending,
    isBusy,
    onKindChange,
    onPropose,
    onSubmit,
}: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const { errors } = form.formState;
    return (
        <>
            <SheetHeading
                title={t('newFolder.title')}
                description={description}
            />
            <form
                method="post"
                noValidate
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4 overflow-y-auto px-5 pt-2 pb-6"
            >
                <Field>
                    <Label htmlFor={NAME_ID}>{t('form.name.label')}</Label>
                    <Input
                        id={NAME_ID}
                        autoComplete="off"
                        enterKeyHint="done"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={NAME_ERROR_ID}
                        {...form.register('name')}
                    />
                    <FieldError id={NAME_ERROR_ID}>
                        {errors.name?.message}
                    </FieldError>
                </Field>
                <FolderKindSwitch
                    kind={kind}
                    onChange={onKindChange}
                />
                {kind === FolderKindEnum.SMART ? (
                    <>
                        <CommandButton
                            variant="outline"
                            label={t('template.propose')}
                            pendingLabel={t('template.proposing')}
                            isPending={isProposing}
                            isBusy={isBusy}
                            onClick={onPropose}
                        />
                        <CardTemplateFields
                            subject={form.register('subject')}
                            subjectError={errors.subject?.message ?? null}
                            editor={template}
                        />
                    </>
                ) : null}
                <SubmitButton
                    label={t('newFolder.submit')}
                    pendingLabel={t('newFolder.creating')}
                    isPending={isPending}
                    isBusy={isBusy}
                />
            </form>
        </>
    );
}
