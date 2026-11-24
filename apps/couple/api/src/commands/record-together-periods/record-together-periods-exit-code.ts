// Numbers of sysexits.h, so that a shell script can tell a typing mistake from a refusal or an unknown account.
export const RecordTogetherPeriodsExitCodeEnum = {
    SUCCESS: 0,
    FAILURE: 1,
    USAGE: 64,
    REFUSED: 65,
    UNKNOWN_ACCOUNT: 67,
} as const;

export type RecordTogetherPeriodsExitCode =
    (typeof RecordTogetherPeriodsExitCodeEnum)[keyof typeof RecordTogetherPeriodsExitCodeEnum];
