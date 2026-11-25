import {
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@cocooning/design-system';

type Props = {
    readonly title: string;
    readonly description: string;
};

// The title of a sheet and the line under it, which names the dialog for screen readers.
export function SheetHeading({ title, description }: Props) {
    return (
        <DrawerHeader className="flex-col items-start gap-1 px-5 pt-4">
            <DrawerTitle className="text-xl break-words">{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
    );
}
