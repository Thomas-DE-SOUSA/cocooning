import { Badge } from '@cocooning/design-system';
import { Sparkles } from 'lucide-react';

type Props = { readonly label: string };

// R17: the « IA » mark of a smart folder, in terracotta like the mockups of the smart folders.
export function SmartBadge({ label }: Props) {
    return (
        <Badge className="gap-1 rounded-full bg-primary/15 font-sans text-primary">
            <Sparkles
                aria-hidden="true"
                className="size-3"
            />
            {label}
        </Badge>
    );
}
