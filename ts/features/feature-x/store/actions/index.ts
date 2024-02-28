import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../utils/errors";
import { FxCardType } from "../../types/FxCardType";

/**
 * post the signature passing a signatureBody
 */
export const fxRequestItem = createAsyncAction(
  "FX_REQUEST",
  "FX_SUCCESS",
  "FX_FAILURE"
)<void, FxCardType, NetworkError>();

export type FXActions = ActionType<typeof fxRequestItem>;
