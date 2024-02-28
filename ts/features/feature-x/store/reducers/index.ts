import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import fxCardsReducer, { FxCardsState } from "./fxCards";

export type FxState = {
  cards: FxCardsState;
};

const fxReducer = combineReducers<FxState, Action>({
  cards: fxCardsReducer
});

export default fxReducer;
