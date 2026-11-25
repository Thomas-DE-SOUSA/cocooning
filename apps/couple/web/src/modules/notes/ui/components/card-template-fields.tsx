import { CARD_FIELD_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import {
    Button,
    Field,
    FieldError,
    Input,
    Label,
    Textarea,
} from '@cocooning/design-system';
import { Plus } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import type { CardTemplateEditor } from '../../view-models/card-template-editor.view-model';
import { CardFieldChips } from './card-field-chips';

type Props = {
    readonly subject: UseFormRegisterReturn<'subject'>;
    readonly subjectError: string | null;
    readonly editor: CardTemplateEditor;
};

const SUBJECT_ID = 'folder-subject';
const SUBJECT_HINT_ID = 'folder-subject-hint';
const SUBJECT_ERROR_ID = 'folder-subject-error';
const NEW_FIELD_ID = 'folder-new-field';
const FIELDS_ERROR_ID = 'folder-fields-error';

// R17: the subject of a smart folder and the fields of its card template, corrected by the couple.
export function CardTemplateFields({ subject, subjectError, editor }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    // Enter adds the field typed instead of sending the whole form.
    const addOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        editor.onAddField();
    };
    return (
        <>
            <Field>
                <Label htmlFor={SUBJECT_ID}>{t('form.subject.label')}</Label>
                <Textarea
                    id={SUBJECT_ID}
                    rows={3}
                    aria-invalid={subjectError !== null}
                    aria-describedby={`${SUBJECT_HINT_ID} ${SUBJECT_ERROR_ID}`}
                    {...subject}
                />
                <p
                    id={SUBJECT_HINT_ID}
                    className="text-sm text-muted-foreground"
                >
                    {t('template.subjectHint')}
                </p>
                <FieldError id={SUBJECT_ERROR_ID}>{subjectError}</FieldError>
            </Field>
            <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-semibold">
                    {t('template.fields')}
                </legend>
                <CardFieldChips
                    fields={editor.fields}
                    onRemove={editor.onRemoveField}
                />
                <div className="flex gap-2">
                    <Input
                        id={NEW_FIELD_ID}
                        aria-label={t('template.newField')}
                        placeholder={t('template.newField')}
                        autoComplete="off"
                        enterKeyHint="enter"
                        maxLength={CARD_FIELD_NAME_MAX_LENGTH}
                        value={editor.newField}
                        aria-describedby={FIELDS_ERROR_ID}
                        onChange={(event) =>
                            editor.onNewFieldChange(event.target.value)
                        }
                        onKeyDown={addOnEnter}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={editor.onAddField}
                    >
                        <Plus aria-hidden="true" />
                        {t('template.addField')}
                    </Button>
                </div>
                <FieldError id={FIELDS_ERROR_ID}>{editor.error}</FieldError>
            </fieldset>
        </>
    );
}
