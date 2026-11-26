import {
    type EventTint,
    EventTintEnum,
} from '../../view-models/event-tint.view-model';

// Decision 0057: each tint is a design token, light and dark; Tailwind only sees classes written in full.
export const TINT_FILL: Readonly<Record<EventTint, string>> = {
    [EventTintEnum.SAGE]: 'bg-label-sage',
    [EventTintEnum.ROSE]: 'bg-label-rose',
    [EventTintEnum.TERRACOTTA]: 'bg-label-terracotta',
    [EventTintEnum.OCHRE]: 'bg-label-ochre',
    [EventTintEnum.SLATE]: 'bg-label-slate',
    [EventTintEnum.PLUM]: 'bg-label-plum',
    [EventTintEnum.MINT]: 'bg-label-mint',
    [EventTintEnum.PEBBLE]: 'bg-label-pebble',
    [EventTintEnum.NEUTRAL]: 'bg-label-none',
};

export const TINT_BORDER: Readonly<Record<EventTint, string>> = {
    [EventTintEnum.SAGE]: 'border-label-sage',
    [EventTintEnum.ROSE]: 'border-label-rose',
    [EventTintEnum.TERRACOTTA]: 'border-label-terracotta',
    [EventTintEnum.OCHRE]: 'border-label-ochre',
    [EventTintEnum.SLATE]: 'border-label-slate',
    [EventTintEnum.PLUM]: 'border-label-plum',
    [EventTintEnum.MINT]: 'border-label-mint',
    [EventTintEnum.PEBBLE]: 'border-label-pebble',
    [EventTintEnum.NEUTRAL]: 'border-label-none',
};
