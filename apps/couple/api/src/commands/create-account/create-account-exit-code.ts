// Numbers of sysexits.h, so that a shell script can tell a typing mistake from a refusal.
export const CreateAccountExitCodeEnum = {
    SUCCESS: 0,
    FAILURE: 1,
    USAGE: 64,
    REFUSED: 65,
} as const;

export type CreateAccountExitCode =
    (typeof CreateAccountExitCodeEnum)[keyof typeof CreateAccountExitCodeEnum];
