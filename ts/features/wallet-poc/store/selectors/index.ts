import { GlobalState } from "../../../../store/reducers/types";

export const selectWalletCards = (state: GlobalState) =>
  Object.values(state.features.walletPoc.cards);
