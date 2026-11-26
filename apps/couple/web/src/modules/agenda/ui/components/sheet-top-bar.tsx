'use client';

import {
    Button,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    Spinner,
} from '@cocooning/design-system';

type Props = {
    readonly formId: string;
    readonly title: string;
    readonly description: string;
    readonly cancelLabel: string;
    readonly submitLabel: string;
    readonly pendingLabel: string;
    readonly isSubmitting: boolean;
    readonly isBusy: boolean;
    readonly onCancel: () => void;
};

// The top row of an agenda sheet: cancel, the title, and the submit button of the form below (linked by formId).
export function SheetTopBar(props: Props) {
    return (
        <>
            <DrawerHeader className="justify-between">
                <Button
                    variant="ghost"
                    className="px-3 text-muted-foreground"
                    onClick={props.onCancel}
                >
                    {props.cancelLabel}
                </Button>
                <DrawerTitle className="text-lg">{props.title}</DrawerTitle>
                <Button
                    type="submit"
                    form={props.formId}
                    className="px-3"
                    disabled={props.isBusy}
                    aria-busy={props.isSubmitting}
                >
                    {props.isSubmitting ? (
                        <Spinner aria-label={props.pendingLabel} />
                    ) : (
                        props.submitLabel
                    )}
                </Button>
            </DrawerHeader>
            <DrawerDescription className="sr-only">
                {props.description}
            </DrawerDescription>
        </>
    );
}
