import * as E from "fp-ts/lib/Either";
import { put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { TransactionClient } from "../../common/api/client";
import { withPaymentsSessionToken } from "../../common/utils/withPaymentsSessionToken";
import { hidePaymentsBizEventsReceiptAction } from "../store/actions";
/**
 * Handle the remote call to hide the transaction receipt
 * @param action
 */
export function* handleDisableBizEventsTransactionReceipt(
  disablePaidNotice: TransactionClient["disablePaidNotice"],
  action: ActionType<(typeof hidePaymentsBizEventsReceiptAction)["request"]>
) {
  try {
    const getTransactionReceiptResult = yield* withPaymentsSessionToken(
      disablePaidNotice,
      action,
      {
        "event-id": action.payload.transactionId
      },
      "Authorization"
    );
    if (E.isLeft(getTransactionReceiptResult)) {
      action.payload.onError?.();
      yield* put(
        hidePaymentsBizEventsReceiptAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionReceiptResult.left))
          )
        })
      );
      return;
    }

    if (getTransactionReceiptResult.right.status === 200) {
      yield* put(
        hidePaymentsBizEventsReceiptAction.success(
          getTransactionReceiptResult.right.value
        )
      );
      action.payload.onSuccess?.();
    } else if (getTransactionReceiptResult.right.status !== 401) {
      // The 401 status is handled by the withPaymentsSessionToken
      action.payload.onError?.();
      yield* put(
        hidePaymentsBizEventsReceiptAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${getTransactionReceiptResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    action.payload.onError?.();
    yield* put(
      hidePaymentsBizEventsReceiptAction.failure({
        ...getNetworkError(e)
      })
    );
  }
}
