import SV_ROUTES from "./routes";

export type SvVoucherListNavigatorParamsList = {
  [SV_ROUTES.VOUCHER_LIST.LIST]: undefined;
  [SV_ROUTES.VOUCHER_LIST.DETAILS]: undefined;
};

export type SvVoucherGenerationNavigatorParamsList = {
  [SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.SELECT_BENEFICIARY_CATEGORY]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.STUDENT_SELECT_DESTINATION]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.DISABLED_ADDITIONAL_INFO]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.WORKER_CHECK_INCOME_THRESHOLD]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.WORKER_SELECT_DESTINATION]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.SICK_CHECK_INCOME_THRESHOLD]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.SICK_SELECT_DESTINATION]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.SELECT_FLIGHTS_DATA]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.SUMMARY]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.VOUCHER_GENERATED]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.KO_CHECK_RESIDENCE]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.KO_SELECT_BENEFICIARY_CATEGORY]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.KO_CHECK_INCOME_THRESHOLD]: undefined;
  [SV_ROUTES.VOUCHER_GENERATION.TIMEOUT_GENERATED_VOUCHER]: undefined;
};
