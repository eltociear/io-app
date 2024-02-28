import { put, takeLatest } from "typed-redux-saga/macro";
import { v4 as uuid } from "uuid";
import { fxRequestItem } from "../store/actions";
import { FxCardType } from "../types/FxCardType";
import { walletAddCards } from "../../wallet-poc/store/actions";
import { ComponentTypes } from "../../wallet-poc/types/ComponentTypes";

export function* watchFXSaga() {
  yield* takeLatest(fxRequestItem.request, handleFxRequestItem);
}

export function* handleFxRequestItem() {
  // simluated async call
  yield new Promise(resolve => setTimeout(resolve, 1000));

  const item = {
    id: uuid(),
    label: "label",
    circuit: "circuit"
  } as FxCardType;

  // dispatch success action
  yield* put(fxRequestItem.success(item as FxCardType));

  yield* put(
    walletAddCards([
      {
        category: "feature-x",
        key: item.id,
        label: "label",
        circuit: "visa",
        description: "desciption",
        cardType: ComponentTypes.FEATUREX
      }
    ])
  );
}
