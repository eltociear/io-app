import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { WalletCard } from "../../types";
import {
  walletAddCards,
  walletRemoveCard,
  walletRemoveCards,
  walletUpsertCard
} from "../actions";

export type WalletState = {
  cards: { [key: string]: WalletCard };
};

const INITIAL_STATE: WalletState = {
  cards: {}
};

const reducer = (
  state: WalletState = INITIAL_STATE,
  action: Action
): WalletState => {
  switch (action.type) {
    case getType(walletUpsertCard):
      return {
        ...state,
        cards: {
          ...state.cards,
          [action.payload.key]: action.payload
        }
      };

    case getType(walletAddCards): {
      const updatedCards = action.payload.reduce(
        (obj, card) => ({
          ...obj,
          [card.key]: card
        }),
        state.cards
      );

      return {
        ...state,
        cards: updatedCards
      };
    }

    case getType(walletRemoveCard): {
      const { [action.payload]: WalletCard, ...cards } = state.cards;
      return {
        ...state,
        cards
      };
    }

    case getType(walletRemoveCards): {
      const updatedCards = Object.fromEntries(
        Object.entries(state.cards).filter(
          ([key]) => !action.payload.includes(key)
        )
      );

      return {
        ...state,
        cards: updatedCards
      };
    }
  }
  return state;
};

export default reducer;
