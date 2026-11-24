export type TogetherTimeViewModel = {
    readonly days: string;
    readonly years: string;
};

export type CoupleOverviewViewModel = {
    readonly formedAt: string;
    readonly togetherTime: TogetherTimeViewModel | null;
};

export type CoupleOverviewPage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | {
          readonly redirectTo: null;
          readonly viewModel: CoupleOverviewViewModel;
      };
