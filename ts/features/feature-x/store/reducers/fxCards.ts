import { pipe } from "fp-ts/lib/function";
import { updateAt } from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { FxCardType } from "../../types/FxCardType";
import { fxRequestItem } from "../actions";

export type FxCardsState = {
  issuedCards: ReadonlyArray<FxCardType>;
};

const emptyState: FxCardsState = {
  issuedCards: []
};

const reducer = (
  state: FxCardsState = emptyState,
  action: Action
): FxCardsState => {
  switch (action.type) {
    case getType(fxRequestItem.success):
      return {
        ...state,
        issuedCards: pipe(
          updateAt(
            state.issuedCards.findIndex(d => d.id === action.payload.id),
            action.payload
          )(state.issuedCards),
          O.getOrElse(
            () =>
              [
                ...state.issuedCards,
                action.payload
              ] as ReadonlyArray<FxCardType>
          )
        )
      };
  }
  return state;
};

// Selectors
export const fxCardsSelector = (
  state: GlobalState
): FxCardsState["issuedCards"] => state.features.fx.cards.issuedCards;

export default reducer;
