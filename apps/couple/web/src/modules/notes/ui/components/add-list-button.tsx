import { Button } from '@cocooning/design-system';
import { Plus } from 'lucide-react';

type Props = {
    readonly label: string;
    readonly onClick: () => void;
};

// The « + » of the Lists tab, above the tab bar: a new list in the section shown (R26).
export function AddListButton({ label, onClick }: Props) {
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10">
            <div className="mx-auto flex max-w-lg justify-end px-5">
                <Button
                    aria-label={label}
                    onClick={onClick}
                    className="pointer-events-auto size-14 rounded-2xl px-0 shadow-lg"
                >
                    <Plus
                        aria-hidden="true"
                        className="size-6"
                    />
                </Button>
            </div>
        </div>
    );
}
