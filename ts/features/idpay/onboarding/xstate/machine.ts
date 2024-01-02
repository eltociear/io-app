import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { and, assertEvent, assign, createMachine } from "xstate";
import {
  LOADING_TAG,
  UPSERTING_TAG,
  WAITING_USER_INPUT_TAG
} from "../../../../xstate/utils";
import {
  OnboardingFailure,
  OnboardingFailureEnum
} from "../types/OnboardingFailure";
import { IdPayOnboardingMachineActors } from "./actors";
import { IdPayOnboardingMachineContext } from "./context";
import { IdPayOnboardingMachineEvents } from "./events";
import {
  getBoolRequiredCriteriaFromContext,
  getMultiRequiredCriteriaFromContext
} from "./selectors";

type IdPayOnboardingMachineInput = {
  serviceId: string;
};

const idPayOnboardingMachine = createMachine(
  {
    context: ({ input }) => ({
      serviceId: input.serviceId,
      initiativeStatus: O.none,
      requiredCriteria: O.none,
      multiConsentsPage: 0,
      multiConsentsAnswers: {},
      selfDeclarationBoolAnswers: {},
      failure: O.none
    }),
    types: {} as {
      context: IdPayOnboardingMachineContext;
      events: IdPayOnboardingMachineEvents;
      // actors: IdPayOnboardingMachineActors;
      input: IdPayOnboardingMachineInput;

      // actions: any;
    },
    id: "IDPAY_ONBOARDING",
    initial: "LOADING_INITIATIVE_DATA",
    on: {
      QUIT_ONBOARDING: {
        actions: "exitOnboarding"
      }
    },
    states: {
      LOADING_INITIATIVE_DATA: {
        tags: [LOADING_TAG],
        invoke: {
          src: "loadInitiativeData",
          id: "invoke-loadInitiativeData",
          input: ({ context }) => context,
          onDone: [
            {
              target: "LOADING_INITIATIVE_STATUS",
              actions: assign(({ event }) => ({ initiative: event.output }))
            }
          ],
          onError: {
            actions: assign(({ event }) => ({
              failure: pipe(O.of(event.error), O.filter(OnboardingFailure.is))
            })),
            target: "DISPLAYING_ONBOARDING_FAILURE"
          }
        }
      },
      LOADING_INITIATIVE_STATUS: {
        tags: [LOADING_TAG],
        invoke: {
          src: "loadInitiativeStatus",
          id: "invoke-loadInitiativeStatus",
          input: ({ context }) => context,
          onDone: [
            {
              target: "DISPLAYING_INITIATIVE",
              actions: assign(({ event }) => ({
                initiativeStatus: event.output
              }))
            }
          ],
          onError: {
            actions: assign(({ event }) => ({
              failure: pipe(O.of(event.error), O.filter(OnboardingFailure.is))
            })),
            target: "DISPLAYING_ONBOARDING_FAILURE"
          }
        }
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
          src: "acceptTos",
          id: "invoke-acceptTos",
          input: ({ context }) => context,
          onDone: [
            {
              target: "LOADING_REQUIRED_CRITERIA"
            }
          ],
          onError: {
            actions: assign(({ event }) => ({
              failure: pipe(O.of(event.error), O.filter(OnboardingFailure.is))
            })),
            target: "DISPLAYING_ONBOARDING_FAILURE"
          }
        }
      },
      LOADING_REQUIRED_CRITERIA: {
        tags: [LOADING_TAG],
        invoke: {
          src: "loadRequiredCriteria",
          id: "invoke-loadRequiredCriteria",
          input: ({ context }) => context,
          onDone: [
            {
              target: "EVALUATING_REQUIRED_CRITERIA",
              actions: assign(({ event }) => ({
                requiredCriteria: event.output
              }))
            }
          ],
          onError: {
            actions: "setFailure",
            target: "DISPLAYING_ONBOARDING_FAILURE"
          }
        }
      },
      EVALUATING_REQUIRED_CRITERIA: {
        tags: [LOADING_TAG],
        always: [
          {
            guard: "hasPDNDRequiredCriteria",
            target: "DISPLAYING_REQUIRED_PDND_CRITERIA"
          },
          {
            guard: "hasSelfRequiredCriteria",
            target: "DISPLAYING_REQUIRED_SELF_CRITERIA"
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
              guard: "hasSelfRequiredCriteria",
              target: "DISPLAYING_REQUIRED_SELF_CRITERIA"
            },
            {
              target: "ACCEPTING_REQUIRED_CRITERIA"
            }
          ],
          BACK: [
            {
              target: "DISPLAYING_INITIATIVE"
            }
          ]
        }
      },
      DISPLAYING_REQUIRED_SELF_CRITERIA: {
        tags: [WAITING_USER_INPUT_TAG],
        initial: "EVALUATING_SELF_CRITERIA",
        onDone: {
          target: "ACCEPTING_REQUIRED_CRITERIA"
          // triggered by the 'final' substate
        },
        states: {
          EVALUATING_SELF_CRITERIA: {
            tags: [LOADING_TAG],
            always: [
              {
                target: "DISPLAYING_BOOL_CRITERIA",
                guard: "hasBoolRequiredCriteria"
              },
              {
                target: "DISPLAYING_MULTI_CRITERIA",
                guard: "hasMultiRequiredCriteria"
              }
            ]
          },
          DISPLAYING_BOOL_CRITERIA: {
            tags: [WAITING_USER_INPUT_TAG],
            entry: "navigateToBoolSelfDeclarationsScreen",
            on: {
              BACK: [
                {
                  target: "#IDPAY_ONBOARDING.DISPLAYING_REQUIRED_PDND_CRITERIA",
                  guard: "hasPDNDRequiredCriteria"
                },
                {
                  target: "#IDPAY_ONBOARDING.DISPLAYING_INITIATIVE"
                }
              ],
              TOGGLE_BOOL_CRITERIA: {
                actions: "toggleBoolCriteria"
              },
              ACCEPT_REQUIRED_BOOL_CRITERIA: [
                {
                  target: "DISPLAYING_MULTI_CRITERIA",
                  guard: "hasMultiRequiredCriteria"
                },
                {
                  target: "ALL_PREREQUISITES_ANSWERED"
                }
              ]
            }
          },
          DISPLAYING_MULTI_CRITERIA: {
            tags: [WAITING_USER_INPUT_TAG],
            entry: "navigateToMultiSelfDeclarationsScreen",
            on: {
              SELECT_MULTI_CONSENT: [
                {
                  // this is an edge case where for some reason
                  // an entry in the consents record is missing
                  // at the end of the flow
                  guard: and([
                    "isLastMultiConsent",
                    "shouldRedoUndefinedPrerequisites"
                  ]),
                  actions: [
                    "addMultiConsent",
                    "redoUndefinedPrerequisites",
                    "navigateToMultiSelfDeclarationsScreen"
                  ]
                },
                {
                  guard: "isLastMultiConsent",
                  actions: "addMultiConsent",
                  target: "ALL_PREREQUISITES_ANSWERED"
                },
                {
                  actions: [
                    "addMultiConsent",
                    "increaseMultiConsentIndex",
                    "navigateToMultiSelfDeclarationsScreen"
                  ]
                }
              ],
              BACK: [
                {
                  guard: "isNotFirstMultiConsent",
                  actions: [
                    "decreaseMultiConsentIndex",
                    "navigateToMultiSelfDeclarationsScreen"
                  ]
                },
                {
                  guard: "hasBoolRequiredCriteria",
                  target: "DISPLAYING_BOOL_CRITERIA"
                },
                {
                  guard: "hasPDNDRequiredCriteria",
                  target: "#IDPAY_ONBOARDING.DISPLAYING_REQUIRED_PDND_CRITERIA"
                },
                {
                  target: "#IDPAY_ONBOARDING.DISPLAYING_INITIATIVE"
                }
              ]
            }
          },

          ALL_PREREQUISITES_ANSWERED: {
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
          input: ({ context }) => context,
          onDone: {
            target: "DISPLAYING_ONBOARDING_COMPLETED"
          },
          onError: {
            actions: assign(({ event }) => ({
              failure: pipe(O.of(event.error), O.filter(OnboardingFailure.is))
            })),
            target: "DISPLAYING_ONBOARDING_FAILURE"
          }
        }
      },
      DISPLAYING_ONBOARDING_COMPLETED: {
        entry: "navigateToCompletionScreen"
      },
      DISPLAYING_ONBOARDING_FAILURE: {
        entry: "navigateToFailureScreen",
        always: [
          {
            guard: "isSessionExpired",
            actions: ["handleSessionExpired", "exitOnboarding"]
          }
        ],
        on: {
          SHOW_INITIATIVE_DETAILS: {
            actions: "navigateToInitiativeMonitoringScreen"
          }
        }
      }
    }
  },
  {
    actions: {
      toggleBoolCriteria: assign(({ event, context }) => {
        assertEvent(event, "TOGGLE_BOOL_CRITERIA");
        return {
          selfDeclarationBoolAnswers: {
            ...context.selfDeclarationBoolAnswers,
            [event.criteria.code]: event.criteria.value
          }
        };
      }),
      addMultiConsent: assign(({ event, context }) => {
        assertEvent(event, "SELECT_MULTI_CONSENT");
        return {
          multiConsentsAnswers: {
            ...context.multiConsentsAnswers,
            [context.multiConsentsPage]: event.data
          }
        };
      }),
      redoUndefinedPrerequisites: assign(({ context }) => {
        const firstUndefinedPage = Object.keys(
          context.multiConsentsAnswers
        ).findIndex(item => item === undefined);
        // converts the record into an array, so that we can use the findIndex method
        return {
          multiConsentsPage: firstUndefinedPage === -1 ? 0 : firstUndefinedPage
        };
      }),
      increaseMultiConsentIndex: assign(({ context }) => ({
        multiConsentsPage: +context.multiConsentsPage + 1
      })),
      decreaseMultiConsentIndex: assign(({ context }) => ({
        multiConsentsPage: +context.multiConsentsPage - 1
      }))
    },
    guards: {
      isSessionExpired: ({ context }) =>
        pipe(
          context.failure,
          OnboardingFailure.decode,
          O.fromEither,
          O.filter(
            failure => failure === OnboardingFailureEnum.SESSION_EXPIRED
          ),
          O.isSome
        ),
      hasPDNDRequiredCriteria: ({ context }) =>
        pipe(
          context.requiredCriteria,
          O.map(({ pdndCriteria }) => pdndCriteria.length > 0),
          O.getOrElse(() => false)
        ),
      hasSelfRequiredCriteria: ({ context }) =>
        pipe(
          context.requiredCriteria,
          O.map(({ selfDeclarationList }) => selfDeclarationList.length > 0),
          O.getOrElse(() => false)
        ),
      hasBoolRequiredCriteria: ({ context }) =>
        getBoolRequiredCriteriaFromContext(context).length > 0,
      hasMultiRequiredCriteria: ({ context }) =>
        getMultiRequiredCriteriaFromContext(context).length > 0,
      shouldRedoUndefinedPrerequisites: ({ context }) =>
        // since the guard is checked before the action that pushes the last page, we need to add 1 to the length
        Object.entries(context.multiConsentsAnswers).length + 1 !==
        getMultiRequiredCriteriaFromContext(context).length,
      isLastMultiConsent: ({ context }) =>
        context.multiConsentsPage >=
        getMultiRequiredCriteriaFromContext(context).length - 1,
      isNotFirstMultiConsent: ({ context }) => context.multiConsentsPage > 0
    }
  }
);

type IDPayOnboardingMachineType = typeof idPayOnboardingMachine;

export { idPayOnboardingMachine };
export type { IDPayOnboardingMachineType };
