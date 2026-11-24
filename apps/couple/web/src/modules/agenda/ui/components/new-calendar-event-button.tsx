import { Button } from '@cocooning/design-system';
import { Plus } from 'lucide-react';

type Props = {
    readonly label: string;
    readonly onClick: () => void;
};

// Floats above the tab bar (pb-[calc(4.5rem+...)] of the tabs layout), aligned on the column of the page.
export function NewCalendarEventButton({ label, onClick }: Props) {
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10">
            <div className="mx-auto flex max-w-lg justify-end px-5">
                <Button
                    aria-label={label}
                    onClick={onClick}
                    className="pointer-events-auto size-14 rounded-[18px] px-0 shadow-lg"
                >
                    <Plus
                        aria-hidden
                        className="size-6"
                    />
                </Button>
            </div>
        </div>
    );
}
