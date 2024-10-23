import {
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  PaymentNoticeNumberFromString,
  RptIdFromString
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { Linking } from "react-native";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../store/reducers/backendStatus";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  PAGOPA_SUPPORT_PHONE_NUMBER,
  addTicketCustomField,
  appendLog,
  assistanceToolRemoteConfig,
  resetCustomFields,
  zendeskCategoryId,
  zendeskPaymentCategory,
  zendeskPaymentFailure,
  zendeskPaymentNav,
  zendeskPaymentOrgFiscalCode,
  zendeskPaymentStartOrigin
} from "../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../zendesk/store/actions";
import { selectOngoingPaymentHistory } from "../../history/store/selectors";
import { walletPaymentRptIdSelector } from "../store/selectors";
import {
  WalletPaymentOutcome,
  getWalletPaymentOutcomeEnumByValue
} from "../types/PaymentOutcomeEnum";
import { WalletPaymentFailure } from "../types/WalletPaymentFailure";
import { formatPaymentNoticeNumber } from "../../common/utils";

type PaymentFailureSupportModalParams = {
  failure?: WalletPaymentFailure;
  outcome?: WalletPaymentOutcome;
  withPhoneAssistance?: boolean;
};

type PaymentFailureSupportModal = {
  bottomSheet: JSX.Element;
  present: () => void;
};

const usePaymentFailureSupportModal = ({
  failure,
  outcome,
  withPhoneAssistance = false
}: PaymentFailureSupportModalParams): PaymentFailureSupportModal => {
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const rptId = useIOSelector(walletPaymentRptIdSelector);
  const paymentHistory = useIOSelector(selectOngoingPaymentHistory);
  const dispatch = useIODispatch();

  const faultCodeDetail =
    failure?.faultCodeDetail ||
    (outcome && getWalletPaymentOutcomeEnumByValue(outcome)) ||
    "";

  const zendeskAssistanceLogAndStart = () => {
    resetCustomFields();
    addTicketCustomField(zendeskCategoryId, zendeskPaymentCategory.value);
    addTicketCustomField(zendeskPaymentOrgFiscalCode, organizationFiscalCode);
    addTicketCustomField(zendeskPaymentNav, paymentNoticeNumber);
    addTicketCustomField(zendeskPaymentFailure, faultCodeDetail);
    addTicketCustomField(
      zendeskPaymentStartOrigin,
      paymentHistory?.startOrigin || "n/a"
    );
    appendLog(JSON.stringify(paymentHistory));
    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceForPayment: true,
        assistanceForCard: false,
        assistanceForFci: false
      })
    );
    dispatch(zendeskSelectedCategory(zendeskPaymentCategory));
  };

  const handleAskAssistance = () => {
    switch (choosenTool) {
      case ToolEnum.zendesk:
        zendeskAssistanceLogAndStart();
        break;
    }
  };

  const paymentNoticeNumber = pipe(
    rptId,
    RptIdFromString.decode,
    O.fromEither,
    O.map(({ paymentNoticeNumber }) => paymentNoticeNumber),
    O.map(PaymentNoticeNumberFromString.encode),
    O.getOrElse(() => "")
  );

  const formattedPaymentNoticeNumber =
    formatPaymentNoticeNumber(paymentNoticeNumber);

  const organizationFiscalCode = pipe(
    rptId,
    RptIdFromString.decode,
    O.fromEither,
    O.map(({ organizationFiscalCode }) => organizationFiscalCode),
    O.map(OrganizationFiscalCode.encode),
    O.getOrElse(() => "")
  );

  const handleCopyAllToClipboard = () => {
    // prettier-ignore
    const data = `${I18n.t("wallet.payment.support.errorCode")}: ${faultCodeDetail}
    ${I18n.t("wallet.payment.support.noticeNumber")}: ${paymentNoticeNumber}
    ${I18n.t("wallet.payment.support.entityCode")}: ${organizationFiscalCode}`;
    clipboardSetStringWithFeedback(data);
  };

  const displayPhoneNumber = PAGOPA_SUPPORT_PHONE_NUMBER.replace(
    /^(\d{2})(\d{4})(\d{4})$/,
    "$1.$2.$3"
  );

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    component: (
      <>
        <ListItemHeader label={I18n.t("wallet.payment.support.supportTitle")} />
        {withPhoneAssistance && (
          <ListItemAction
            label={I18n.t("wallet.payment.support.phone", {
              phoneNumber: displayPhoneNumber
            })}
            accessibilityLabel={I18n.t("wallet.payment.support.phone", {
              phoneNumber: displayPhoneNumber
            })}
            onPress={() =>
              Linking.openURL(`tel:${PAGOPA_SUPPORT_PHONE_NUMBER}`)
            }
            variant="primary"
            icon="phone"
          />
        )}
        <ListItemAction
          label={I18n.t("wallet.payment.support.chat")}
          accessibilityLabel={I18n.t("wallet.payment.support.chat")}
          onPress={() => {
            dismiss();
            handleAskAssistance();
          }}
          variant="primary"
          icon="chat"
        />
        <VSpacer size={24} />
        <ListItemHeader
          label={I18n.t("wallet.payment.support.additionalDataTitle")}
          endElement={{
            type: "buttonLink",
            componentProps: {
              label: I18n.t("wallet.payment.support.copyAll"),
              onPress: handleCopyAllToClipboard
            }
          }}
        />
        <ListItemInfoCopy
          label={I18n.t("wallet.payment.support.errorCode")}
          accessibilityLabel={I18n.t("wallet.payment.support.errorCode")}
          icon="ladybug"
          value={faultCodeDetail}
          onPress={() => clipboardSetStringWithFeedback(faultCodeDetail)}
        />
        <ListItemInfoCopy
          label={I18n.t("wallet.payment.support.noticeNumber")}
          accessibilityLabel={I18n.t("wallet.payment.support.noticeNumber")}
          icon="docPaymentCode"
          value={formattedPaymentNoticeNumber}
          onPress={() => clipboardSetStringWithFeedback(paymentNoticeNumber)}
        />
        <ListItemInfoCopy
          label={I18n.t("wallet.payment.support.entityCode")}
          accessibilityLabel={I18n.t("wallet.payment.support.entityCode")}
          icon="entityCode"
          value={organizationFiscalCode}
          onPress={() => clipboardSetStringWithFeedback(organizationFiscalCode)}
        />
        <VSpacer size={24} />
      </>
    ),
    title: ""
  });

  return {
    bottomSheet,
    present
  };
};

export { usePaymentFailureSupportModal };
