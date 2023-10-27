import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import React, { useCallback, useEffect } from "react";
import { View } from "react-native";
import { useDispatch, useStore } from "react-redux";
import {
  ModulePaymentNotice,
  PaymentNoticeStatus,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18n-js";
import { RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { useNavigation } from "@react-navigation/native";
import { NotificationPaymentInfo } from "../../../../definitions/pn/NotificationPaymentInfo";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { getRptIdStringFromPayment } from "../utils/rptId";
import { GlobalState } from "../../../store/reducers/types";
import {
  paymentStatusForUISelector,
  shouldUpdatePaymentSelector
} from "../store/reducers/payments";
import { useIOSelector } from "../../../store/hooks";
import { updatePaymentForMessage } from "../store/actions";
import { RemoteValue, fold } from "../../bonus/bpd/model/RemoteValue";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import {
  cleanTransactionDescription,
  getV2ErrorMainType
} from "../../../utils/payment";
import { getBadgeTextByPaymentNoticeStatus } from "../../messages/utils/strings";
import { paymentInitializeState } from "../../../store/actions/wallet/payment";
import ROUTES from "../../../navigation/routes";
import { format } from "../../../utils/dates";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../utils/stringBuilder";
import { useIOToast } from "../../../components/Toast";

type MessagePaymentItemProps = {
  index: number;
  messageId: UIMessageId;
  payment: NotificationPaymentInfo;
};

type ProcessedPaymentUIData = {
  paymentNoticeStatus: Exclude<PaymentNoticeStatus, "default">;
  badgeText: string;
};

const paymentNoticeStatusFromDetailV2Enum = (
  detail: Detail_v2Enum
): Exclude<PaymentNoticeStatus, "default"> => {
  const errorType = getV2ErrorMainType(detail);
  switch (errorType) {
    case "EC":
      // TODO
      break;
    case "REVOKED":
      return "revoked";
    case "EXPIRED":
      return "expired";
    case "ONGOING":
      // TODO
      break;
    case "DUPLICATED":
      return "paid";
  }
  return "error";
};

const processedUIPaymentFromDetailV2Enum = (
  detail: Detail_v2Enum
): ProcessedPaymentUIData =>
  pipe(detail, paymentNoticeStatusFromDetailV2Enum, paymentNoticeStatus => ({
    paymentNoticeStatus,
    badgeText: getBadgeTextByPaymentNoticeStatus(paymentNoticeStatus)
  }));

const modulePaymentNoticeForUndefinedOrLoadingPayment = () => (
  <ModulePaymentNotice
    isLoading={true}
    title={""}
    subtitle={""}
    onPress={_ => undefined}
    paymentNoticeStatus={"error"}
    badgeText={""}
  />
);

const modulePaymentNoticeFromPaymentStatus = (
  noticeCode: string,
  paymentStatus: RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>,
  paymentCallback: () => void
) =>
  fold(
    paymentStatus,
    modulePaymentNoticeForUndefinedOrLoadingPayment,
    modulePaymentNoticeForUndefinedOrLoadingPayment,
    payablePayment => {
      const dueDateOrUndefined = pipe(
        payablePayment.dueDate,
        O.fromNullable,
        O.map(
          dueDate =>
            `${I18n.t("wallet.firstTransactionSummary.dueDate")} ${format(
              dueDate,
              "DD/MM/YYYY"
            )}`
        ),
        O.toUndefined
      );
      const description = cleanTransactionDescription(
        payablePayment.causaleVersamento
      );
      const formattedAmount = pipe(
        payablePayment.importoSingoloVersamento,
        centsToAmount,
        formatNumberAmount,
        formattedAmount => `${formattedAmount} €`
      );
      return (
        <ModulePaymentNotice
          title={dueDateOrUndefined}
          subtitle={description}
          paymentNoticeStatus="default"
          paymentNoticeAmount={formattedAmount}
          onPress={paymentCallback}
        />
      );
    },
    processedPaymentDetails => {
      const formattedPaymentNoticeCode = noticeCode
        .replace(/(\d{4})/g, "$1  ")
        .trim();
      const { paymentNoticeStatus, badgeText } =
        processedUIPaymentFromDetailV2Enum(processedPaymentDetails);
      return (
        <ModulePaymentNotice
          title={I18n.t("features.pn.details.noticeCode")}
          subtitle={formattedPaymentNoticeCode}
          onPress={paymentCallback}
          paymentNoticeStatus={paymentNoticeStatus}
          badgeText={badgeText}
        />
      );
    }
  );

export const MessagePaymentItem = ({
  index,
  messageId,
  payment
}: MessagePaymentItemProps) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const store = useStore();
  const toast = useIOToast();

  const paymentId = getRptIdStringFromPayment(payment);

  const globalState = store.getState() as GlobalState;
  const shouldUpdatePayment = shouldUpdatePaymentSelector(
    globalState,
    messageId,
    paymentId
  );
  const paymentStatusForUI = useIOSelector(state =>
    paymentStatusForUISelector(state, messageId, paymentId)
  );

  const startPaymentCallback = useCallback(() => {
    const eitherRptId = RptIdFromString.decode(paymentId);
    if (E.isLeft(eitherRptId)) {
      toast.error(I18n.t("genericError"));
      return;
    }
    dispatch(paymentInitializeState());

    navigation.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
      params: { rptId: eitherRptId.right }
    });
  }, [dispatch, navigation, paymentId, toast]);
  useEffect(() => {
    if (shouldUpdatePayment) {
      const updateAction = updatePaymentForMessage.request({
        messageId,
        paymentId
      });
      // console.log(`=== PaymentItem: dispatch (${messageId}) (${paymentId})`);
      dispatch(updateAction);
    }
  }, [dispatch, messageId, paymentId, shouldUpdatePayment]);
  // console.log(`=== PaymentItem: re-rendering`);
  return (
    <View>
      <VSpacer size={index > 0 ? 8 : 24} />
      {modulePaymentNoticeFromPaymentStatus(
        payment.noticeCode,
        paymentStatusForUI,
        startPaymentCallback
      )}
    </View>
  );
};