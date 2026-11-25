// R11 seen by the partner who reads the event: « Moi », « Toi » or « Nous deux ».
export const ViewerAudienceEnum = {
    ME: 'ME',
    YOU: 'YOU',
    BOTH: 'BOTH',
} as const;

export type ViewerAudience =
    (typeof ViewerAudienceEnum)[keyof typeof ViewerAudienceEnum];
