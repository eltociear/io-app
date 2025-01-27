import {
  cancelAllRunningRequests,
  isFailureResponse,
  nativeRequest
} from "@pagopa/io-react-native-http-client";
import { call, select } from "typed-redux-saga/macro";
import { fimsDomainSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { fimsPartialAbortUrl } from "../store/selectors";
import { deallocateFimsResourcesAndNavigateBack } from "./handleFimsResourcesDeallocation";
import {
  buildAbsoluteUrl,
  computeAndTrackAuthenticationError,
  formatHttpClientResponseForMixPanel
} from "./sagaUtils";

const abortTimeoutMillisecondsGenerator = () => 8000;

export function* handleFimsAbortOrCancel() {
  yield* call(cancelAllRunningRequests);
  const oidcProviderUrl = yield* select(fimsDomainSelector);
  const abortUrlMaybePartial = yield* select(fimsPartialAbortUrl);
  if (oidcProviderUrl && abortUrlMaybePartial) {
    const abortAbsoluteUrl = yield* call(
      buildAbsoluteUrl,
      abortUrlMaybePartial,
      oidcProviderUrl
    );
    if (abortAbsoluteUrl) {
      const abortResponse = yield* call(nativeRequest, {
        url: abortAbsoluteUrl,
        verb: "post",
        followRedirects: true,
        timeoutMilliseconds: abortTimeoutMillisecondsGenerator()
      });
      if (isFailureResponse(abortResponse)) {
        yield* call(
          computeAndTrackAuthenticationError,
          `Abort call failed: ${formatHttpClientResponseForMixPanel(
            abortResponse
          )}`
        );
      }
    } else {
      yield* call(
        computeAndTrackAuthenticationError,
        `Unable to compose absolute Abort call url: ${abortUrlMaybePartial}`
      );
    }
  }

  yield* call(deallocateFimsResourcesAndNavigateBack);
}
