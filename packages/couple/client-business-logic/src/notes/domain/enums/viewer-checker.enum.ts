// R29 seen by the partner who reads the list: the line was checked by « Moi » or by « Toi ».
export const ViewerCheckerEnum = {
    ME: 'ME',
    YOU: 'YOU',
} as const;

export type ViewerChecker =
    (typeof ViewerCheckerEnum)[keyof typeof ViewerCheckerEnum];
