/**
 * The screen to display to the user the various types of errors that occurred during the transaction.
 * Inside the cancel and retry buttons are conditionally returned.
 */
import {
  ButtonOutline,
  ButtonSolid,
  IOPictograms,
  VSpacer
} from "@pagopa/io-app-design-system";
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { Route, useRoute } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as React from "react";
import { ComponentProps } from "react";
import { SafeAreaView, View } from "react-native";
import { connect } from "react-redux";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { ZendeskCategory } from "../../../../definitions/content/ZendeskCategory";
import CopyButtonComponent from "../../../components/CopyButtonComponent";
import { InfoAltScreenComponent } from "../../../components/InfoAltScreenComponent/InfoAltScreenComponent";
import { FooterStackButton } from "../../../components/buttons/FooterStackButtons";
import { H4 } from "../../../components/core/typography/H4";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../features/zendesk/store/actions";
import { useHardwareBackButton } from "../../../hooks/useHardwareBackButton";
import I18n from "../../../i18n";
import { navigateToPaymentManualDataInsertion } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import {
  backToEntrypointPayment,
  paymentAttiva,
  paymentIdPolling,
  paymentVerifica
} from "../../../store/actions/wallet/payment";
import { canShowHelpSelector } from "../../../store/reducers/assistanceTools";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import {
  PaymentHistory,
  paymentsHistorySelector
} from "../../../store/reducers/payments/history";
import { GlobalState } from "../../../store/reducers/types";
import { PayloadForAction } from "../../../types/utils";
import {
  ErrorTypes,
  getCodiceAvviso,
  getPaymentHistoryDetails,
  getV2ErrorMainType
} from "../../../utils/payment";
import {
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
} from "../../../utils/supportAssistance";

export type TransactionErrorScreenNavigationParams = {
  error: O.Option<
    PayloadForAction<
      | (typeof paymentVerifica)["failure"]
      | (typeof paymentAttiva)["failure"]
      | (typeof paymentIdPolling)["failure"]
    >
  >;
  rptId: RptId;
  onCancel: () => void;
};

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const imageTimeout: IOPictograms = "ended";
const imageDefaultFallback: IOPictograms = "fatalError";
const imageMapping: Record<ErrorTypes, IOPictograms> = {
  DATA: "attention",
  DUPLICATED: "attention",
  EC: "attention",
  ONGOING: "timing",
  UNCOVERED: "umbrellaNew",
  REVOKED: "fatalError",
  EXPIRED: "ended",
  TECHNICAL: "fatalError",
  NOT_FOUND: "attention"
};

const requestZendeskAssistanceForPaymentFailure = (
  rptId: RptId,
  payment?: PaymentHistory
) => {
  resetCustomFields();
  // Set pagamenti_pagopa as category
  addTicketCustomField(zendeskCategoryId, zendeskPaymentCategory.value);

  // Add organization fiscal code custom field
  addTicketCustomField(
    zendeskPaymentOrgFiscalCode,
    rptId.organizationFiscalCode
  );
  // Add rptId custom field
  addTicketCustomField(zendeskPaymentNav, getCodiceAvviso(rptId));
  if (payment) {
    if (payment.failure) {
      // Add failure custom field
      addTicketCustomField(zendeskPaymentFailure, payment.failure);
    }
    // Add start origin custom field
    addTicketCustomField(zendeskPaymentStartOrigin, payment.startOrigin);
    // Append the payment history details in the log
    appendLog(getPaymentHistoryDetails(payment));
  }
};
type ScreenUIContents = {
  image: IOPictograms;
  title: string;
  subtitle?: React.ReactNode;
  footerButtons?: ComponentProps<typeof FooterStackButton>;
};

const ErrorCodeCopyComponent = ({
  error
}: {
  error: keyof typeof Detail_v2Enum;
}): React.ReactElement => (
  <View testID={"error-code-copy-component"}>
    <H4 weight={"Regular"} style={{ textAlign: "center" }}>
      {I18n.t("wallet.errors.assistanceLabel")}
    </H4>
    <H4 weight={"Bold"} testID={"error-code"} style={{ textAlign: "center" }}>
      {error}
    </H4>
    <VSpacer size={16} />
    <CopyButtonComponent textToCopy={error} />
  </View>
);

/**
 * Convert the error code into a user-readable string
 * @param maybeError
 * @param rptId
 * @param onCancel
 * @param choosenTool
 * @param paymentHistory
 * @param canShowHelpButton
 * @param handleZendeskRequestAssistance
 */
export const errorTransactionUIElements = (
  maybeError: TransactionErrorScreenNavigationParams["error"],
  rptId: RptId,
  onCancel: () => void,
  choosenTool: ToolEnum,
  handleZendeskRequestAssistance: () => void,
  canShowHelpButton: boolean,
  paymentHistory?: PaymentHistory
): ScreenUIContents => {
  const requestAssistance = () => {
    switch (choosenTool) {
      case ToolEnum.zendesk:
        requestZendeskAssistanceForPaymentFailure(rptId, paymentHistory);
        handleZendeskRequestAssistance();
        break;
      default:
        return;
    }
  };

  const sendReportButtonConfirm: ComponentProps<typeof ButtonSolid> = {
    onPress: requestAssistance,
    label: I18n.t("wallet.errors.sendReport"),
    accessibilityLabel: I18n.t("wallet.errors.sendReport"),
    testID: "sendReportButtonConfirm"
  };

  const closeButtonConfirm: ComponentProps<typeof ButtonSolid> = {
    onPress: onCancel,
    label: I18n.t("global.buttons.close"),
    accessibilityLabel: I18n.t("global.buttons.close"),
    testID: "closeButtonConfirm"
  };

  const sendReportButtonCancel: ComponentProps<typeof ButtonOutline> = {
    onPress: requestAssistance,
    label: I18n.t("wallet.errors.sendReport"),
    accessibilityLabel: I18n.t("wallet.errors.sendReport"),
    testID: "sendReportButtonCancel"
  };

  const closeButtonCancel: ComponentProps<typeof ButtonOutline> = {
    onPress: onCancel,
    label: I18n.t("global.buttons.close"),
    accessibilityLabel: I18n.t("global.buttons.close"),
    testID: "closeButtonCancel"
  };

  const errorORUndefined = O.toUndefined(maybeError);

  if (errorORUndefined === "PAYMENT_ID_TIMEOUT") {
    return {
      image: imageTimeout,
      title: I18n.t("wallet.errors.MISSING_PAYMENT_ID"),
      footerButtons: { primaryActionProps: { ...closeButtonCancel } }
    };
  }

  const errorMacro = getV2ErrorMainType(errorORUndefined);
  const validError = t.keyof(Detail_v2Enum).decode(errorORUndefined);
  const genericErrorSubTestID = "generic-error-subtitle";
  const subtitle = pipe(
    validError,
    E.fold(
      _ => (
        <H4 weight={"Regular"} testID={genericErrorSubTestID}>
          {I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")}
        </H4>
      ),
      error => <ErrorCodeCopyComponent error={error} />
    )
  );

  const image = errorMacro ? imageMapping[errorMacro] : imageDefaultFallback;

  switch (errorMacro) {
    case "TECHNICAL":
      return {
        image,
        title: I18n.t("wallet.errors.TECHNICAL"),
        subtitle,
        footerButtons: canShowHelpButton
          ? {
              primaryActionProps: { ...sendReportButtonConfirm },
              secondaryActionProps: { ...closeButtonCancel }
            }
          : { primaryActionProps: { ...closeButtonCancel } }
      };
    case "DATA":
      return {
        image,
        title: I18n.t("wallet.errors.DATA"),
        subtitle,
        footerButtons: canShowHelpButton
          ? {
              primaryActionProps: { ...closeButtonConfirm },
              secondaryActionProps: { ...sendReportButtonCancel }
            }
          : { primaryActionProps: { ...closeButtonConfirm } }
      };
    case "EC":
      return {
        image,
        title: I18n.t("wallet.errors.EC"),
        subtitle,
        footerButtons: canShowHelpButton
          ? {
              primaryActionProps: { ...sendReportButtonConfirm },
              secondaryActionProps: { ...closeButtonCancel }
            }
          : { primaryActionProps: { ...closeButtonCancel } }
      };
    case "DUPLICATED":
      return {
        image,
        title: I18n.t("wallet.errors.DUPLICATED"),
        footerButtons: { primaryActionProps: { ...closeButtonCancel } }
      };
    case "ONGOING":
      return {
        image,
        title: I18n.t("wallet.errors.ONGOING"),
        subtitle: (
          <H4
            weight={"Regular"}
            style={{ textAlign: "center" }}
            testID={"ongoing-subtitle"}
          >
            {I18n.t("wallet.errors.ONGOING_SUBTITLE")}
          </H4>
        ),
        footerButtons: canShowHelpButton
          ? {
              primaryActionProps: { ...closeButtonConfirm },
              secondaryActionProps: { ...sendReportButtonCancel }
            }
          : {
              primaryActionProps: { ...closeButtonConfirm }
            }
      };
    case "EXPIRED":
      return {
        image,
        title: I18n.t("wallet.errors.EXPIRED"),
        subtitle: (
          <H4
            weight={"Regular"}
            style={{ textAlign: "center" }}
            testID={"expired-subtitle"}
          >
            {I18n.t("wallet.errors.contactECsubtitle")}
          </H4>
        ),
        footerButtons: { primaryActionProps: { ...closeButtonCancel } }
      };
    case "REVOKED":
      return {
        image,
        title: I18n.t("wallet.errors.REVOKED"),
        subtitle: (
          <H4
            weight={"Regular"}
            style={{ textAlign: "center" }}
            testID={"revoked-subtitle"}
          >
            {I18n.t("wallet.errors.contactECsubtitle")}
          </H4>
        ),
        footerButtons: {
          primaryActionProps: { ...closeButtonCancel }
        }
      };
    case "NOT_FOUND":
      return {
        image,
        title: I18n.t("wallet.errors.NOT_FOUND"),
        subtitle: (
          <H4
            weight={"Regular"}
            style={{ textAlign: "center" }}
            testID={"not-found-subtitle"}
          >
            {I18n.t("wallet.errors.NOT_FOUND_SUBTITLE")}
          </H4>
        ),
        footerButtons: { primaryActionProps: { ...closeButtonConfirm } }
      };
    case "UNCOVERED":
    default:
      return {
        image,
        title: I18n.t("wallet.errors.GENERIC_ERROR"),
        subtitle: (
          <H4 weight={"Regular"} testID={genericErrorSubTestID}>
            {I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")}
          </H4>
        ),
        footerButtons: canShowHelpButton
          ? {
              primaryActionProps: { ...closeButtonConfirm },
              secondaryActionProps: { ...sendReportButtonCancel }
            }
          : {
              primaryActionProps: { ...closeButtonConfirm }
            }
      };
  }
};

const TransactionErrorScreen = (props: Props) => {
  const { rptId, error, onCancel } =
    useRoute<
      Route<"PAYMENT_TRANSACTION_ERROR", TransactionErrorScreenNavigationParams>
    >().params;

  const { paymentsHistory } = props;

  const codiceAvviso = getCodiceAvviso(rptId);
  const organizationFiscalCode = rptId.organizationFiscalCode;

  const paymentHistory = paymentsHistory.find(
    p =>
      codiceAvviso === getCodiceAvviso(p.data) &&
      organizationFiscalCode === p.data.organizationFiscalCode
  );

  const choosenTool = assistanceToolRemoteConfig(props.assistanceToolConfig);
  const { title, subtitle, footerButtons, image } = errorTransactionUIElements(
    error,
    rptId,
    onCancel,
    choosenTool,
    () => {
      props.zendeskSupportWorkunitStart();
      props.zendeskSelectedCategory(zendeskPaymentCategory);
    },
    props.canShowHelp,
    paymentHistory
  );
  const handleBackPress = () => {
    props.backToEntrypointPayment();
    return true;
  };

  useHardwareBackButton(handleBackPress);

  return (
    <BaseScreenComponent>
      <SafeAreaView style={IOStyles.flex}>
        <InfoAltScreenComponent image={image} title={title} body={subtitle} />
        {footerButtons && <FooterStackButton {...footerButtons} />}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  paymentsHistory: paymentsHistorySelector(state),
  assistanceToolConfig: assistanceToolConfigSelector(state),
  canShowHelp: canShowHelpSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToPaymentManualDataInsertion: (isInvalidAmount: boolean) =>
    navigateToPaymentManualDataInsertion({ isInvalidAmount }),
  backToEntrypointPayment: () => dispatch(backToEntrypointPayment()),
  zendeskSupportWorkunitStart: () =>
    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceForPayment: true,
        assistanceForCard: false,
        assistanceForFci: false
      })
    ),
  zendeskSelectedCategory: (category: ZendeskCategory) =>
    dispatch(zendeskSelectedCategory(category))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionErrorScreen);
