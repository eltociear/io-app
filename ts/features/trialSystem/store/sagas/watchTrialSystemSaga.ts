import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { IOToast } from "@pagopa/io-app-design-system";
import { SessionToken } from "../../../../types/SessionToken";
import { TrialSystemClient, createTrialSystemClient } from "../../api/client";
import { apiUrlPrefix } from "../../../../config";
import {
  trialSystemStatus,
  trialSystemStatusReset,
  trialSystemStatusActivation,
  trialSystemStatusDeactivation
} from "../actions";
import { getError } from "../../../../utils/errors";
import I18n from "../../../../i18n";

function* handleTrialSystemStatusActivation(
  createSubscription: TrialSystemClient["createSubscription"],
  action: ActionType<typeof trialSystemStatusActivation.request>
) {
  try {
    const result = yield* call(createSubscription, {
      trialId: action.payload
    });

    if (E.isLeft(result)) {
      yield* put(
        trialSystemStatusActivation.failure({
          trialId: action.payload,
          error: new Error(readableReport(result.left))
        })
      );
    } else if (result.right.status === 201) {
      yield* put(trialSystemStatusActivation.success(result.right.value));
      IOToast.success(I18n.t("features.trialSystem.toast.subscribed"));
    } else {
      yield* put(
        trialSystemStatusActivation.failure({
          trialId: action.payload,
          error: new Error(`response status ${result.right.status}`)
        })
      );
      IOToast.error(I18n.t("global.genericError"));
    }
  } catch (e) {
    yield* put(
      trialSystemStatusActivation.failure({
        trialId: action.payload,
        error: getError(e)
      })
    );
    IOToast.error(I18n.t("global.genericError"));
  }
}

function* handleTrialSystemStatusDeactivation(
  createSubscription: TrialSystemClient["createSubscription"],
  action: ActionType<typeof trialSystemStatusDeactivation.request>
) {
  try {
    const result = yield* call(createSubscription, {
      trialId: action.payload
    });

    if (E.isLeft(result)) {
      yield* put(
        trialSystemStatusDeactivation.failure({
          trialId: action.payload,
          error: new Error(readableReport(result.left))
        })
      );
    } else if (result.right.status === 201) {
      yield* put(trialSystemStatusDeactivation.success(result.right.value));
      IOToast.success(I18n.t("features.trialSystem.toast.subscribed"));
    } else {
      yield* put(
        trialSystemStatusDeactivation.failure({
          trialId: action.payload,
          error: new Error(`response status ${result.right.status}`)
        })
      );
      IOToast.error(I18n.t("global.genericError"));
    }
  } catch (e) {
    yield* put(
      trialSystemStatusDeactivation.failure({
        trialId: action.payload,
        error: getError(e)
      })
    );
    IOToast.error(I18n.t("global.genericError"));
  }
}

function* handleTrialSystemStatus(
  getSubscription: TrialSystemClient["getSubscription"],
  action: ActionType<typeof trialSystemStatus.request>
) {
  try {
    const result = yield* call(getSubscription, {
      trialId: action.payload
    });

    if (E.isLeft(result)) {
      yield* put(
        trialSystemStatus.failure({
          trialId: action.payload,
          error: new Error(readableReport(result.left))
        })
      );
      return;
    }

    if (result.right.status === 200) {
      yield* put(trialSystemStatus.success(result.right.value));
      return;
    }

    if (result.right.status === 404) {
      yield* put(trialSystemStatusReset(action.payload));
      return;
    } else {
      yield* put(
        trialSystemStatus.failure({
          trialId: action.payload,
          error: new Error(`response status ${result.right.status}`)
        })
      );
    }
  } catch (e) {
    yield* put(
      trialSystemStatus.failure({
        trialId: action.payload,
        error: getError(e)
      })
    );
  }
}

export function* watchTrialSystemSaga(bearerToken: SessionToken): SagaIterator {
  const trialSystemClient = createTrialSystemClient(apiUrlPrefix, bearerToken);

  yield* takeLatest(
    trialSystemStatusActivation.request,
    handleTrialSystemStatusActivation,
    trialSystemClient.createSubscription
  );

  yield* takeLatest(
    trialSystemStatusDeactivation.request,
    handleTrialSystemStatusDeactivation,
    trialSystemClient.createSubscription // TODO replace with correct api client once deactivation is available
  );

  yield* takeLatest(
    trialSystemStatus.request,
    handleTrialSystemStatus,
    trialSystemClient.getSubscription
  );
}
