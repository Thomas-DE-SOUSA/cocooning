export type CoupleOverviewViewModel = {
    readonly formedAt: string;
};

export type CoupleOverviewPage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | {
          readonly redirectTo: null;
          readonly viewModel: CoupleOverviewViewModel;
      };
