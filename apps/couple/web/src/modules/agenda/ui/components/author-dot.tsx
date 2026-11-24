import { cn } from '@cocooning/design-system';
import {
    type AuthorColor,
    AuthorColorEnum,
} from '../../view-models/agenda-screen.view-model';

const FILLED: Readonly<Record<AuthorColor, string>> = {
    [AuthorColorEnum.TERRACOTTA]: 'bg-primary',
    [AuthorColorEnum.SAGE]: 'bg-secondary-foreground',
};

const RING: Readonly<Record<AuthorColor, string>> = {
    [AuthorColorEnum.TERRACOTTA]: 'border-[1.5px] border-primary',
    [AuthorColorEnum.SAGE]: 'border-[1.5px] border-secondary-foreground',
};

type Props = {
    readonly color: AuthorColor;
    readonly isPrivate: boolean;
    readonly className: string;
};

// The color of the author (terracotta and dark sage differ in lightness too); a hollow ring for "rien que pour moi".
export function AuthorDot({ color, isPrivate, className }: Props) {
    return (
        <span
            aria-hidden="true"
            data-color={color}
            data-private={isPrivate}
            className={cn(
                'inline-block shrink-0 rounded-full',
                isPrivate ? RING[color] : FILLED[color],
                className,
            )}
        />
    );
}
