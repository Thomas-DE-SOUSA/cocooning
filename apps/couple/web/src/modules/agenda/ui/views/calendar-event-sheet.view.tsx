'use client';

import type {
    CalendarEventForm,
    CalendarEventFormInput,
} from '@cocooning/couple-client-business-logic/agenda';
import { DrawerContent } from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import {
    type CalendarEventCommand,
    CalendarEventCommandEnum,
} from '../../view-models/calendar-event-command.view-model';
import type { CalendarLabelItem } from '../../view-models/calendar-label.view-model';
import { CalendarEventDeletion } from '../components/calendar-event-deletion';
import { SheetTopBar } from '../components/sheet-top-bar';
import { CalendarEventFormView } from './calendar-event-form.view';

type Props = {
    readonly isEdition: boolean;
    readonly form: UseFormReturn<
        CalendarEventFormInput,
        unknown,
        CalendarEventForm
    >;
    readonly isAllDay: boolean;
    readonly showsPrivacy: boolean;
    readonly labels: readonly CalendarLabelItem[];
    readonly pending: CalendarEventCommand | null;
    readonly isBusy: boolean;
    readonly isDeletionAsked: boolean;
    readonly onAllDayChange: (allDay: boolean) => void;
    readonly onCancel: () => void;
    readonly onNewLabel: () => void;
    readonly onSubmit: (form: CalendarEventForm) => void;
    readonly onAskDeletion: () => void;
    readonly onConfirmDeletion: () => void;
    readonly onKeep: () => void;
};

const FORM_ID = 'calendar-event-form';

const LABEL_KEYS = {
    create: {
        title: 'drawer.createTitle',
        submit: 'drawer.create',
        pending: 'drawer.creating',
    },
    edit: {
        title: 'drawer.editTitle',
        submit: 'drawer.save',
        pending: 'drawer.saving',
    },
} as const;

// The bottom sheet of an event: cancel, title and submit on top, the form, then the deletion of an edited event (R9).
export function CalendarEventSheetView(props: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    const keys = LABEL_KEYS[props.isEdition ? 'edit' : 'create'];
    const isSubmitting =
        props.pending !== null &&
        props.pending !== CalendarEventCommandEnum.DELETE_CALENDAR_EVENT;
    return (
        <DrawerContent>
            <SheetTopBar
                formId={FORM_ID}
                title={t(keys.title)}
                description={t('drawer.description')}
                cancelLabel={t('drawer.cancel')}
                submitLabel={t(keys.submit)}
                pendingLabel={t(keys.pending)}
                isSubmitting={isSubmitting}
                isBusy={props.isBusy}
                onCancel={props.onCancel}
            />
            <div className="flex flex-col gap-6 overflow-y-auto px-5 pt-2 pb-6">
                <CalendarEventFormView
                    formId={FORM_ID}
                    form={props.form}
                    isAllDay={props.isAllDay}
                    isEdition={props.isEdition}
                    showsPrivacy={props.showsPrivacy}
                    labels={props.labels}
                    onNewLabel={props.onNewLabel}
                    onAllDayChange={props.onAllDayChange}
                    onSubmit={props.onSubmit}
                />
                {props.isEdition ? (
                    <CalendarEventDeletion
                        isPending={
                            props.pending ===
                            CalendarEventCommandEnum.DELETE_CALENDAR_EVENT
                        }
                        isBusy={props.isBusy}
                        isDeletionAsked={props.isDeletionAsked}
                        onAskDeletion={props.onAskDeletion}
                        onConfirmDeletion={props.onConfirmDeletion}
                        onKeep={props.onKeep}
                    />
                ) : null}
            </div>
        </DrawerContent>
    );
}
