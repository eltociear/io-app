/* eslint-disable no-underscore-dangle */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { assign, createMachine } from "xstate";
import { InitiativeDto } from "../../../../../definitions/idpay/onboarding/InitiativeDto";
import { StatusEnum } from "../../../../../definitions/idpay/onboarding/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { SelfConsentDTO } from "../../../../../definitions/idpay/onboarding/SelfConsentDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import { SelfDeclarationDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationDTO";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationMultiDTO";
import {
  LOADING_TAG,
  UPSERTING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../utils/xstate";
import { OnboardingFailureType } from "./failure";

// Context types
export type Context = {
  serviceId?: string;
  initiative?: InitiativeDto;
  initiativeStatus?: StatusEnum;
  requiredCriteria?: O.Option<RequiredCriteriaDTO>;
  failure?: OnboardingFailureType;
  multiConsents?: Array<SelfConsentDTO | undefined>;
};

// Events types
type E_SELECT_INITIATIVE = {
  type: "SELECT_INITIATIVE";
  serviceId: string;
};

type E_ACCEPT_TOS = {
  type: "ACCEPT_TOS";
};

type E_ACCEPT_REQUIRED_PDND_CRITERIA = {
  type: "ACCEPT_REQUIRED_PDND_CRITERIA";
};

type E_ACCEPT_REQUIRED_SELF_CRITERIA = {
  type: "ACCEPT_REQUIRED_SELF_CRITERIA";
};

type E_ACCEPT_REQUIRED_BOOL_CRITERIA = {
  type: "ACCEPT_REQUIRED_BOOL_CRITERIA";
};

type E_QUIT_ONBOARDING = {
  type: "QUIT_ONBOARDING";
};

type E_GO_BACK = {
  type: "GO_BACK";
};

type E_ADD_SELF_CONSENT = {
  type: "ADD_SELF_CONSENT";
  data: SelfConsentDTO;
  page: number;
};
type E_ALL_CRITERIA_ACCEPTED = {
  type: "ALL_CRITERIA_ACCEPTED";
};

type Events =
  | E_SELECT_INITIATIVE
  | E_ACCEPT_TOS
  | E_ACCEPT_REQUIRED_PDND_CRITERIA
  | E_ACCEPT_REQUIRED_SELF_CRITERIA
  | E_QUIT_ONBOARDING
  | E_GO_BACK
  | E_ADD_SELF_CONSENT
  | E_ACCEPT_REQUIRED_BOOL_CRITERIA
  | E_ALL_CRITERIA_ACCEPTED;

// Services types
type Services = {
  loadInitiative: {
    data: InitiativeDto;
  };
  loadInitiativeStatus: {
    data: StatusEnum | undefined;
  };
  acceptTos: {
    data: undefined;
  };
  loadRequiredCriteria: {
    data: O.Option<RequiredCriteriaDTO>;
  };
  acceptRequiredCriteria: {
    data: undefined;
  };
};

type FilterType = typeof SelfDeclarationDTO.is;

const discernCriteria = (context: Context, filterFunc: FilterType) => {
  const requiredCriteria = context.requiredCriteria;
  return pipe(
    requiredCriteria,
    O.fromNullable,
    O.flatten,
    O.fold(
      () => [],
      some => some.selfDeclarationList.filter(filterFunc)
    )
  );
};

const getMultiRequiredCriteria = (context: Context) =>
  discernCriteria(
    context,
    SelfDeclarationMultiDTO.is
  ) as Array<SelfDeclarationMultiDTO>;

export const getBoolRequiredCriteria = (context: Context) =>
  discernCriteria(
    context,
    SelfDeclarationBoolDTO.is
  ) as Array<SelfDeclarationBoolDTO>;

const isOnboardingDone = (context: Context) => {
  const initiativeStatus = context.initiativeStatus;
  return (
    initiativeStatus === StatusEnum.ONBOARDING_OK ||
    initiativeStatus === StatusEnum.ON_EVALUATION
  );
};

const isOnboardingFailed = (context: Context) => {
  const initiativeStatus = context.initiativeStatus;
  return initiativeStatus === StatusEnum.ONBOARDING_KO;
};

const hasPDNDRequiredCriteria = (context: Context) => {
  const requiredCriteria = context.requiredCriteria;
  if (requiredCriteria !== undefined && O.isSome(requiredCriteria)) {
    return requiredCriteria.value.pdndCriteria.length > 0;
  }

  return false;
};

const hasSelfRequiredCriteria = (context: Context) => {
  const requiredCriteria = context.requiredCriteria;
  if (requiredCriteria !== undefined && O.isSome(requiredCriteria)) {
    return requiredCriteria.value.selfDeclarationList.length > 0;
  }

  return false;
};

const hasBoolRequiredCriteria = (context: Context) =>
  getBoolRequiredCriteria(context).length > 0;

const hasMultiRequiredCriteria = (context: Context) =>
  getMultiRequiredCriteria(context).length > 0;

const createIDPayOnboardingMachine = () =>
  /** @xstate-layout N4IgpgJg5mDOIC5QEkAiAFAggTQPoHkA5AIX0wCVVlCBxAYgEUBVZAFQJLMupoG0AGALqJQABwD2sAJYAXKeIB2IkAA9EARgDsmgGwA6dQBZN-bTvU6AHJf46ANCACeGgEwBfNw7RY8RUhSpaPQB1TDYeXGpwzFZkADUAUVwAZQSAGQSAYViiOlSM7MjCaNjEgWEkEAlpOUVlNQQAZkN1PUtGzQBWAE5DW35GxssXRodnBE6XfUNuxqMXTuNZ5o8vDBwOf24gtLJAmiKS+IS6CEUwPSkFADdxAGsLgBtxAEMIZAVZKRe5a7By5TVL51SoNSyGTp6XRTBb8dSNbo6bouMaIRYuPQubSddSWXQDHQ41YgbwbPxcfZ6XaYfaHWIxY50MAAJ2Z4mZelEjx+ADN2QBbPTPN4fL4-KR-AGVIG1JSgxDaVEIFyWZGYwwuTUtSw9FxaYmk3ycAI8Kl7CJRemlJLJVgxJjJU7nS43e5PV7vT5ycV-ZIyH4AV1gUrEkmBctADQhrRGRm6iM6nUaC0WSpc-Dxeh6yZ0U1smu6nQN6yNW0p1NpluQDMSKTtrAdTNZ7M53JkfOZguFnrFvzAfsDwaEgLDsvqiGjmLmMwTSZThiVuM6-D0hM6XSmk3aPWLPk2FNNCTimDSTAZtDp1etdftjpDVVH8gjqgVmiVcy6bUMOu-OkJXSMXcyWNbYaD0I8TzPWILyrGsbXrRteHUCpQxqJ9xwQbpVT0QZtEsKx+A1TRETTAscMRZNuiMfg9W6TQgNLA8ggg09zwOWDr1tW86F4FwUIfNCQUjRAsO6HCOk0fCbCIkinA0eMMQhVUjFVLFl3ozwSRLfcTSCKhknQNIcAtYorUZTBMkyBJ0HYVh8GSe8ZXQ+Umi0FcdA6cEdH4QsOmMRdNBVPQqJxOiLEkwxDEaBidNAvQLKsmyIjsx0zgUC4rluB49BeABjXKwFEGRWEkRzHyEl9MLfOTlSsfRJnhLC-28zcYvJXSwIS6zoIOFKmzZDkuV5AUcvywritK4dpXK58wWq8YsXjVdGk6VU6P6ZE2pA8tzQvcgEmYZB9tQXBMnINgEnOzAnXSl0svdN5yDAABHAMpGZSBMmZWQWW+MrBNmjR5o0dQMVzZdCPUQsjHUTodC2stTQrCJ9sO47TvO1hLurfqWyG9sRu7J7Xvez7vpkX6Xn+8MML-SFEVVRoMzmEYVrTHRjBwkYIZ6fDiIRpiwJYqCUYOlh0bOi6rp4qbUJplzGisPQBlByKtEkzRBnsGqXF6HC+jhFbkSmfnNMNWLKWFtjcFR8WEhOyWselpD+KciqGkVGrYd1zFNEi-CVvTbQBY68Dj1YnqbbFo77YxqWcd412ZowujF34OE2naXQ-y6CEiTN7T2ri-TDOMvbo-R9BUEIB3Mex66upsqO0djqua7jp3q2pscXIhTRldmXOVRxXXCUXFbISkhYEXBP2opD4vkAMozsFFluTrb2v44byzuubu2N+rrfO8wF2RwBjDIv7nyOnRHVQYTRdQZXQPQoWQsBm6BfKRLle14P3Am8O71zoDQfAuBiAWQANLd2csJBAV8B63w1PfUenRFx9H0EzdchgObeSikWAue4i4-yXqXVe5d14pHSAAMWAdLNKFxYD+gpnoc2JDTS-zLgcW2McTr5DoY7eusD3aICZtoAw1g4RGGaLgqYSoPL93jHCcw645je2-pwshf9KEAIEfQnGYCIHQJEYDBB64kFD1QY-L22C9BRVMKony-AkzwyIcBRGeltHcP3nw6haRBF12lkYyBmQYHIXPvLeB79GgGF6CrdMSZNDqAwbMZW3lVS4K1jgzRXjl4+N4ejfRQirph0gtbYpQSE6ywElEyqsNCL2OaCYOGsxwoLhqnDDEcNLBQyGKDKwkxclgS4RQnhFdY6VO3mUiOEQpknx4hE6aF8XINMME04wLikRzB0H7JULTM62ELFRGicNhl6FGf-Px8z656EyNgTIGRcAAFkmBpFiAYhuqB+G0NOkQVIhBWCmIwlMawU5ekqgAtgpUvSVymFxJRXMi03FrGIdtLR+Sxm+KKb8kp1Y7kPKea895yBPl0BpD8gJfzCAAqBUsuWPdondFsMFawIx4wal2YMJUSSoQuEirrXoyY-bRXcYxUOlzdHXNxVUzAFzvFYtIPgNIZLG7sEKbHJVKq8WnxqW7MxtEYzZiwitCECIeVDExPyyKGp4wWF1uctVVyJaypuhlV02U8oFSKsTN6H0IBfR+t9Kmerk4K3UAMKEcNsw2sIvhceisDDUWoh5cGorNIKHEBAOAyh2HotoJExllUAC0cw0zrN6PGXoxEbAWGTOc0I4QYKmSvMcfxWQciEELXAyq-lOkzCzFYIw34dm9HOcjZtRxEjdtERMCEOE4bJltYmJElgeULFZbYZcKDh5fzFRbJGu12ItrgjeBsyQZ1mMCmmeFmIKKEV6Phdw+6OHMXDiLSdZlaxcXPZe2mzLM5xgcYrfC2sFoRrErDPEvQPJM3UIBF9+aRkKpMlOhIf6XIqj6FCeJQ6qLflTl7A5NhrCSW8kmHElhHW7ySheFKGH4GDCZsFLogwegzGXGzIjLi2gZjxPhFxK1cTjqPdi2OOqGOVSmGJeMQxhWqMClFdmK02jUUCnMZYLjzlW0jhq4+9dJNRmBsqfCfLb7G1xOnZ9qKPGC3lZi51rcj6fMMyJFEtjNRxJMHBuYzQ6LnMleMqhNyrquYQPB7CiZmj8oisiJUfQMR4jVu0XZHLRU2fFYvBzUqcVUp1TMj9BwQvVjC6DDoWYkwamMOCOLNUkT9yREKxasMTCGACyhnLkyZXTPuY8pIxKPkSeWXUhoCxCSHJ8vy2RXKFEtEzrspMsNES53a9loLejusn3s+QiIWqXPDaLQ0BFsTCKTFzH0XQVEeXeTvUK3BUMrD1sQ54zqNHdMTP06Fg7PbRsmH7pJWG2SFua0XCqMScJklRURNDwkq2dsXlfQcTI+BnmGQSFjVAYW2MVs8kidcRhEwdPGA-LBzKBiLAGCgqjz27OBYPReGhYRTz7TC8y2JalNTwjx7rInYiVStG0H5XWkx07U48EAA */
  createMachine(
    {
      context: {},
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
        services: {} as Services
      },
      predictableActionArguments: true,
      id: "IDPAY_ONBOARDING",
      initial: "WAITING_INITIATIVE_SELECTION",
      on: {
        QUIT_ONBOARDING: {
          actions: "exitOnboarding"
        }
      },
      states: {
        WAITING_INITIATIVE_SELECTION: {
          tags: [LOADING_TAG],
          on: {
            SELECT_INITIATIVE: {
              target: "LOADING_INITIATIVE",
              actions: "selectInitiative"
            }
          }
        },

        LOADING_INITIATIVE: {
          tags: [LOADING_TAG],
          invoke: {
            src: "loadInitiative",
            id: "loadInitiative",
            onDone: [
              {
                target: "LOADING_INITIATIVE_STATUS",
                actions: "loadInitiativeSuccess"
              }
            ],
            onError: [
              {
                target: "DISPLAYING_ONBOARDING_FAILURE",
                actions: "loadInitiativeFailure"
              }
            ]
          }
        },

        LOADING_INITIATIVE_STATUS: {
          tags: [LOADING_TAG],
          invoke: {
            src: "loadInitiativeStatus",
            id: "loadInitiativeStatus",
            onDone: [
              {
                target: "EVALUATING_INITIATIVE_STATUS",
                actions: "loadInitiativeStatusSuccess"
              }
            ],
            onError: [
              {
                target: "DISPLAYING_ONBOARDING_FAILURE",
                actions: "loadInitiativeStatusFailure"
              }
            ]
          }
        },

        EVALUATING_INITIATIVE_STATUS: {
          always: [
            {
              target: "DISPLAYING_ONBOARDING_FAILURE",
              cond: "isOnboardingDone",
              actions: "onOnboardingDone"
            },
            {
              target: "DISPLAYING_ONBOARDING_FAILURE",
              cond: "isOnboardingFailed",
              actions: "onOnboardingFailed"
            },
            {
              target: "DISPLAYING_INITIATIVE"
            }
          ]
        },

        DISPLAYING_INITIATIVE: {
          entry: "navigateToInitiativeDetailsScreen",
          on: {
            ACCEPT_TOS: {
              target: "ACCEPTING_TOS"
            }
          }
        },

        ACCEPTING_TOS: {
          tags: [UPSERTING_TAG],
          invoke: {
            id: "acceptTos",
            src: "acceptTos",
            onDone: [
              {
                target: "LOADING_REQUIRED_CRITERIA"
              }
            ],
            onError: [
              {
                target: "DISPLAYING_ONBOARDING_FAILURE",
                actions: "acceptTosFailure"
              }
            ]
          }
        },

        LOADING_REQUIRED_CRITERIA: {
          tags: [LOADING_TAG],
          invoke: {
            id: "loadRequiredCriteria",
            src: "loadRequiredCriteria",
            onDone: [
              {
                target: "EVALUATING_REQUIRED_CRITERIA",
                actions: "loadRequiredCriteriaSuccess"
              }
            ],
            onError: [
              {
                target: "DISPLAYING_ONBOARDING_FAILURE",
                actions: "loadRequiredCriteriaFailure"
              }
            ]
          }
        },

        // Self transition node to evaluate required criteria
        EVALUATING_REQUIRED_CRITERIA: {
          tags: [LOADING_TAG],
          always: [
            {
              target: "DISPLAYING_REQUIRED_PDND_CRITERIA",
              cond: "hasPDNDRequiredCriteria"
            },
            {
              target: "DISPLAYING_REQUIRED_SELF_CRITERIA",
              cond: "hasSelfRequiredCriteria"
            },
            {
              target: "DISPLAYING_ONBOARDING_COMPLETED"
            }
          ]
        },

        DISPLAYING_REQUIRED_PDND_CRITERIA: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToPDNDCriteriaScreen",
          on: {
            ACCEPT_REQUIRED_PDND_CRITERIA: [
              {
                target: "DISPLAYING_REQUIRED_SELF_CRITERIA",
                cond: "hasSelfRequiredCriteria"
              },
              {
                target: "ACCEPTING_REQUIRED_CRITERIA"
              }
            ],
            GO_BACK: [
              {
                target: "DISPLAYING_INITIATIVE"
              }
            ]
          }
        },

        DISPLAYING_REQUIRED_SELF_CRITERIA: {
          tags: [WAITING_USER_INPUT_TAG],
          initial: "EVALUATING_SELF_CRITERIA",
          on: {
            GO_BACK: [
              {
                target: "DISPLAYING_REQUIRED_PDND_CRITERIA",
                cond: "hasPDNDRequiredCriteria"
              },
              {
                target: "DISPLAYING_INITIATIVE"
              }
            ]
          },
          onDone: {
            target: "ACCEPTING_REQUIRED_CRITERIA"
          },
          states: {
            EVALUATING_SELF_CRITERIA: {
              tags: [LOADING_TAG],
              always: [
                {
                  target: "DISPLAYING_BOOL_CRITERIA",
                  cond: "hasBoolRequiredCriteria"
                },
                {
                  target: "CYCLE_MULTI_CRITERIA",
                  cond: "hasMultiRequiredCriteria"
                }
              ]
            },
            CYCLE_MULTI_CRITERIA: {
              tags: [WAITING_USER_INPUT_TAG],
              entry: "navigateToMultiSelfDeclarationsScreen",
              on: {
                ADD_SELF_CONSENT: {
                  actions: "addSelfConsent"
                },
                ALL_CRITERIA_ACCEPTED: {
                  target: "ALL_CRITERIA_ACCEPTED"
                }
              }
            },
            DISPLAYING_BOOL_CRITERIA: {
              tags: [WAITING_USER_INPUT_TAG],
              entry: "navigateToBoolSelfDeclarationsScreen",
              on: {
                ACCEPT_REQUIRED_BOOL_CRITERIA: [
                  {
                    cond: "hasMultiRequiredCriteria",
                    target: "CYCLE_MULTI_CRITERIA"
                  },
                  {
                    target: "ALL_CRITERIA_ACCEPTED"
                  }
                ]
              }
            },
            ALL_CRITERIA_ACCEPTED: {
              type: "final"
            }
          }
        },

        ACCEPTING_REQUIRED_CRITERIA: {
          tags: [UPSERTING_TAG],
          entry: "navigateToCompletionScreen",
          invoke: {
            src: "acceptRequiredCriteria",
            id: "acceptRequiredCriteria",
            onDone: [
              {
                target: "DISPLAYING_ONBOARDING_COMPLETED"
              }
            ]
          }
        },

        DISPLAYING_ONBOARDING_COMPLETED: {
          entry: "navigateToCompletionScreen"
        },

        DISPLAYING_ONBOARDING_FAILURE: {
          entry: "navigateToFailureScreen"
        }
      }
    },
    {
      actions: {
        selectInitiative: assign((_, event) => ({
          serviceId: event.serviceId
        })),
        loadInitiativeSuccess: assign((_, event) => ({
          initiative: event.data
        })),
        loadInitiativeFailure: assign((_, event) => ({
          failure: event.data as OnboardingFailureType
        })),
        loadInitiativeStatusSuccess: assign((_, event) => ({
          initiativeStatus: event.data
        })),
        loadInitiativeStatusFailure: assign((_, event) => ({
          failure: event.data as OnboardingFailureType
        })),
        onOnboardingDone: assign((_, __) => ({
          failure: OnboardingFailureType.ALREADY_COMPLETED
        })),
        onOnboardingFailed: assign((_, __) => ({
          failure: OnboardingFailureType.ONBOARDING_KO
        })),
        loadRequiredCriteriaSuccess: assign((_, event) => ({
          requiredCriteria: event.data
        })),
        loadRequiredCriteriaFailure: assign((_, event) => ({
          failure: event.data as OnboardingFailureType
        })),
        acceptTosFailure: assign((_, event) => ({
          failure: event.data as OnboardingFailureType
        })),
        addSelfConsent: assign((_, event) => {
          const newConsents = _.multiConsents ?? [];
          // required in order to use an array instead of a number:key map
          // eslint-disable-next-line functional/immutable-data
          newConsents[event.page] = event.data;

          return {
            multiConsents: newConsents
          };
        })
      },
      guards: {
        isOnboardingDone,
        isOnboardingFailed,
        hasPDNDRequiredCriteria,
        hasSelfRequiredCriteria,
        hasBoolRequiredCriteria,
        hasMultiRequiredCriteria
      }
    }
  );

type IDPayOnboardingMachineType = ReturnType<
  typeof createIDPayOnboardingMachine
>;

export type { IDPayOnboardingMachineType };
export { createIDPayOnboardingMachine };

