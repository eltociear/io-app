import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { TrialId } from "../../../../../definitions/trial_systwem/TrialId";
import { Subscription } from "../../../../../definitions/trial_systwem/Subscription";

type ErrorPayload = {
  trialId: TrialId;
  error: Error;
};

export const trialSystemStatusActivation = createAsyncAction(
  "TRIAL_SYSTEM_ACTIVATION_REQUEST",
  "TRIAL_SYSTEM_ACTIVATION_SUCCESS",
  "TRIAL_SYSTEM_ACTIVATION_FAILURE"
)<TrialId, Subscription, ErrorPayload>();

export const trialSystemStatusDeactivation = createAsyncAction(
  "TRIAL_SYSTEM_DEACTIVATION_REQUEST",
  "TRIAL_SYSTEM_DEACTIVATION_SUCCESS",
  "TRIAL_SYSTEM_DEACTIVATION_FAILURE"
)<TrialId, Subscription, ErrorPayload>();

export const trialSystemStatus = createAsyncAction(
  "TRIAL_SYSTEM_STATUS_REQUEST",
  "TRIAL_SYSTEM_STATUS_SUCCESS",
  "TRIAL_SYSTEM_STATUS_FAILURE"
)<TrialId, Subscription, ErrorPayload>();

export const trialSystemStatusReset = createStandardAction(
  "TRIAL_SYSTEM_STATUS_RESET"
)<TrialId>();

export type TrialSystemActions =
  | ActionType<typeof trialSystemStatus>
  | ActionType<typeof trialSystemStatusActivation>
  | ActionType<typeof trialSystemStatusReset>
  | ActionType<typeof trialSystemStatusDeactivation>;
