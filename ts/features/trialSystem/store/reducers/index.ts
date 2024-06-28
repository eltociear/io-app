import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import { TrialId } from "../../../../../definitions/trial_systwem/TrialId";
import {
  SubscriptionState,
  SubscriptionStateEnum
} from "../../../../../definitions/trial_systwem/SubscriptionState";
import { Action } from "../../../../store/actions/types";
import {
  trialSystemStatus,
  trialSystemStatusReset,
  trialSystemStatusActivation,
  trialSystemStatusDeactivation
} from "../actions";
import { GlobalState } from "../../../../store/reducers/types";

export type TrialSystemState = Record<
  TrialId,
  pot.Pot<SubscriptionState, Error>
>;

const initialState: TrialSystemState = {};

/**
 * Store the activation state of the Trial System
 * @param state
 * @param action
 */
export const trialSystemActivationStatusReducer = (
  state: TrialSystemState = initialState,
  action: Action
): TrialSystemState => {
  switch (action.type) {
    case getType(trialSystemStatus.request):
      return {
        ...state,
        [action.payload]: pot.toLoading(state[action.payload] ?? pot.none)
      };
    case getType(trialSystemStatusActivation.success):
    case getType(trialSystemStatusDeactivation.success):
    case getType(trialSystemStatus.success):
      return {
        ...state,
        [action.payload.trialId]: pot.some(action.payload.state)
      };
    case getType(trialSystemStatusReset):
      return {
        ...state,
        [action.payload]: pot.none
      };
    case getType(trialSystemStatusActivation.failure):
    case getType(trialSystemStatusDeactivation.failure):
    case getType(trialSystemStatus.failure):
      return {
        ...state,
        [action.payload.trialId]: pot.toError(
          state[action.payload.trialId] ?? pot.none,
          action.payload.error
        )
      };
    case getType(trialSystemStatusActivation.request):
      return {
        ...state,
        [action.payload]: pot.toUpdating(
          state[action.payload] ?? pot.none,
          SubscriptionStateEnum.SUBSCRIBED
        )
      };
    case getType(trialSystemStatusDeactivation.request):
      return {
        ...state,
        [action.payload]: pot.toUpdating(
          state[action.payload] ?? pot.none,
          SubscriptionStateEnum.UNSUBSCRIBED
        )
      };
    default:
      return state;
  }
};

export const trialSystemActivationStatusSelector = (
  state: GlobalState
): TrialSystemState => state.trialSystem;

export const trialStatusSelector = (id: TrialId) => (state: GlobalState) =>
  pipe(
    state,
    trialSystemActivationStatusSelector,
    status => status[id] ?? pot.none,
    pot.toUndefined
  );

export const isLoadingTrialStatusSelector =
  (id: TrialId) => (state: GlobalState) =>
    pipe(
      state,
      trialSystemActivationStatusSelector,
      status => status[id] ?? pot.none,
      pot.isLoading
    );

export const isUpdatingTrialStatusSelector =
  (id: TrialId) => (state: GlobalState) =>
    pipe(
      state,
      trialSystemActivationStatusSelector,
      status => status[id] ?? pot.none,
      pot.isUpdating
    );
