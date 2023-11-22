export const ITW_ROUTES = {
  MAIN: "ITW_MAIN" as const,
  ISSUING: {
    PID: {
      CIE: {
        EXPIRED_SCREEN: "ITW_ISSUING_PID_CIE_EXPIRED_SCREEN",
        PIN_SCREEN: "ITW_ISSUING_PID_CIE_PIN_SCREEN",
        CARD_READER_SCREEN: "ITW_ISSUING_PID_CIE_CARD_READER_SCREEN",
        CONSENT_DATA_USAGE: "ITW_ISSUING_PID_CIE_CONSENT_DATA_USAGE",
        WRONG_PIN_SCREEN: "ITW_ISSUING_PID_CIE_WRONG_PIN_SCREEN",
        PIN_TEMP_LOCKED_SCREEN: "ITW_ISSUING_PID_CIE_PIN_TEMP_LOCKED_SCREEN"
      } as const,
      INFO: "ITW_ISSUING_PID_INFO",
      AUTH: "ITW_ISSUING_PID_AUTH",
      AUTH_INFO: "ITW_ISSUING_PID_AUTH_INFO",
      REQUEST: "ITW_ISSUING_PID_REQUEST",
      PREVIEW: "ITW_ISSUING_PID_PREVIEW",
      ADDING: "ITW_ISSUING_PID_ADDING"
    } as const,
    CREDENTIAL: {
      CATALOG: "ITW_ISSUING_CREDENTIAL_CATALOG",
      CHECKS: "ITW_ISSUING_CREDENTIAL_CHECKS",
      AUTH: "ITW_ISSUING_CREDENTIAL_AUTH",
      PREVIEW: "ITW_ISSUING_CREDENTIAL_PREVIEW"
    } as const
  } as const,
  PRESENTATION: {
    PID: {
      DETAILS: "ITW_PRESENTATION_PID_DETAILS",
      REMOTE: {
        CHECKS: "ITW_PRESENTATION_PID_REMOTE_CHECKS",
        DATA: "ITW_PRESENTATION_PID_REMOTE_DATA",
        RESULT: "ITW_PRESENTATION_PID_REMOTE_RESULT"
      } as const
    } as const,
    CREDENTIAL: {
      DETAILS: "ITW_PRESENTATION_CREDENTIAL_DETAILS",
      REMOTE: {
        CHECKS: "ITW_PRESENTATION_CREDENTIAL_CHECKS",
        DATA: "ITW_PRESENTATION_CREDENTIAL_DATA",
        RESULT: "ITW_PRESETATION_CREDENTIAL_RESULT"
      } as const
    } as const
  } as const,
  GENERIC: {
    NOT_AVAILABLE: "ITW_GENERIC_NOT_AVAILABLE"
  } as const
};
