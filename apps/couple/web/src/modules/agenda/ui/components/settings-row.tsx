import { Label } from '@cocooning/design-system';
import type { ReactNode } from 'react';

type Props = {
    readonly label: string;
    readonly htmlFor: string;
    readonly children: ReactNode;
};

// A row of 48 px in a grouped block, in the style of the phone settings: the label on the left, its control on the right.
export function SettingsRow({ label, htmlFor, children }: Props) {
    return (
        <div className="flex min-h-12 items-center justify-between gap-3 px-4">
            <Label
                htmlFor={htmlFor}
                className="text-base font-normal"
            >
                {label}
            </Label>
            {children}
        </div>
    );
}
