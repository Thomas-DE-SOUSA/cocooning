'use client';

import type { CalendarLabelForm } from '@cocooning/couple-client-business-logic/agenda';
import {
    DrawerContent,
    Field,
    FieldError,
    Input,
    Label,
} from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CALENDAR_LABELS_NAMESPACE } from '../../data/calendar-labels-i18n-namespace';
import {
    type CalendarLabelCommand,
    CalendarLabelCommandEnum,
} from '../../view-models/calendar-label-command.view-model';
import { CalendarLabelDeletion } from '../components/calendar-label-deletion';
import { LabelColorPicker } from '../components/label-color-picker';
import { SheetTopBar } from '../components/sheet-top-bar';

type Props = {
    readonly isEdition: boolean;
    readonly form: UseFormReturn<CalendarLabelForm>;
    readonly pending: CalendarLabelCommand | null;
    readonly isBusy: boolean;
    readonly isDeletionAsked: boolean;
    readonly onCancel: () => void;
    readonly onSubmit: (form: CalendarLabelForm) => void;
    readonly onAskDeletion: () => void;
    readonly onConfirmDeletion: () => void;
    readonly onKeep: () => void;
};

const FORM_ID = 'calendar-label-form';
const NAME_ID = 'calendar-label-name';
const NAME_ERROR_ID = 'calendar-label-name-error';

const KEYS = {
    create: {
        title: 'sheet.createTitle',
        submit: 'sheet.create',
        pending: 'sheet.creating',
    },
    edit: {
        title: 'sheet.editTitle',
        submit: 'sheet.save',
        pending: 'sheet.saving',
    },
} as const;

// R12: the name and the colour of a label; an edited one can also be deleted (R14), a new one says labels are shared.
export function CalendarLabelSheetView(props: Props) {
    const { t } = useTranslation(CALENDAR_LABELS_NAMESPACE);
    const keys = KEYS[props.isEdition ? 'edit' : 'create'];
    const { errors } = props.form.formState;
    const isDeleting =
        props.pending === CalendarLabelCommandEnum.DELETE_CALENDAR_LABEL;
    return (
        <DrawerContent>
            <SheetTopBar
                formId={FORM_ID}
                title={t(keys.title)}
                description={t('sheet.description')}
                cancelLabel={t('sheet.cancel')}
                submitLabel={t(keys.submit)}
                pendingLabel={t(keys.pending)}
                isSubmitting={props.pending !== null && !isDeleting}
                isBusy={props.isBusy}
                onCancel={props.onCancel}
            />
            <div className="flex flex-col gap-6 overflow-y-auto px-5 pt-2 pb-6">
                <form
                    id={FORM_ID}
                    method="post"
                    noValidate
                    onSubmit={props.form.handleSubmit(props.onSubmit)}
                    className="flex flex-col gap-5"
                >
                    <Field>
                        <Label htmlFor={NAME_ID}>
                            {t('form.labelName.label')}
                        </Label>
                        <Input
                            id={NAME_ID}
                            autoComplete="off"
                            enterKeyHint="done"
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={NAME_ERROR_ID}
                            {...props.form.register('name')}
                        />
                        <FieldError id={NAME_ERROR_ID}>
                            {errors.name?.message}
                        </FieldError>
                    </Field>
                    <LabelColorPicker form={props.form} />
                </form>
                {props.isEdition ? (
                    <CalendarLabelDeletion
                        isPending={isDeleting}
                        isBusy={props.isBusy}
                        isDeletionAsked={props.isDeletionAsked}
                        onAskDeletion={props.onAskDeletion}
                        onConfirmDeletion={props.onConfirmDeletion}
                        onKeep={props.onKeep}
                    />
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {t('sheet.sharedHint')}
                    </p>
                )}
            </div>
        </DrawerContent>
    );
}
