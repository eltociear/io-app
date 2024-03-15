import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../types/utils";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { WalletClient } from "../../common/api/client";
import { walletDetailsGetInstrument } from "../store/actions";

/**
 * Handle the remote call to start Wallet onboarding payment methods list
 * @param getPaymentMethods
 * @param action
 */
export function* handleGetWalletDetails(
  getWalletById: WalletClient["getWalletById"],
  action: ActionType<(typeof walletDetailsGetInstrument)["request"]>
) {
  try {
    const getwalletDetailsRequest = getWalletById({
      walletId: action.payload.walletId
    });

    const getWalletDetailsResult = (yield* call(
      withRefreshApiCall,
      getwalletDetailsRequest,
      action
    )) as SagaCallReturnType<typeof getWalletById>;

    yield* pipe(
      getWalletDetailsResult,
      E.fold(
        function* (error) {
          yield* put(
            walletDetailsGetInstrument.failure(
              getGenericError(new Error(readablePrivacyReport(error)))
            )
          );
        },
        function* ({ status, value }) {
          switch (status) {
            case 200:
              yield* put(walletDetailsGetInstrument.success(value));
              break;
            default:
              yield* put(
                walletDetailsGetInstrument.failure(
                  getGenericError(new Error(`response status code ${status}`))
                )
              );
          }
        }
      )
    );
  } catch (e) {
    yield* put(walletDetailsGetInstrument.failure({ ...getNetworkError(e) }));
  }
}
