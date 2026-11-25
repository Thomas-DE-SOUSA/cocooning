import { cn } from '@cocooning/design-system';
import type { CardCandidate } from '../../view-models/note-card-choice.view-model';

type Props = {
    readonly candidates: readonly CardCandidate[];
    readonly isBusy: boolean;
    readonly onChoose: (index: number) => void;
};

// R19: at most three candidates, each chosen by a tap: its name, then what tells it apart.
export function CardCandidates({ candidates, isBusy, onChoose }: Props) {
    return (
        <ul className="flex flex-col gap-2">
            {candidates.map((candidate, index) => (
                <li key={`${candidate.label} ${candidate.detail}`}>
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onChoose(index)}
                        className={cn(
                            'flex w-full flex-col gap-0.5 rounded-xl bg-background p-3 text-left focus-visible:outline-2 focus-visible:outline-ring',
                            isBusy && 'opacity-60',
                        )}
                    >
                        <span className="font-semibold break-words">
                            {candidate.label}
                        </span>
                        <span className="text-sm break-words text-muted-foreground">
                            {candidate.detail}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    );
}
