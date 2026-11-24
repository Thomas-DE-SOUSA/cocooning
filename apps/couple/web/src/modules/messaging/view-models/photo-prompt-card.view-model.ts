export const PhotoPromptCardStatusEnum = {
    OPEN: 'OPEN',
    ANSWERED: 'ANSWERED',
} as const;

// R8, R9: today's prompt once issued; minutesBeforeLate is null once the photo would come late.
export type PhotoPromptCard =
    | {
          readonly status: typeof PhotoPromptCardStatusEnum.OPEN;
          readonly photoPromptId: string;
          readonly issuedAt: string;
          readonly minutesBeforeLate: number | null;
          readonly isAnsweredByPartner: boolean;
      }
    | {
          readonly status: typeof PhotoPromptCardStatusEnum.ANSWERED;
          readonly isAnsweredByPartner: boolean;
      };
