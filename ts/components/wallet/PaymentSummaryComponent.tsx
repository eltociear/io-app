import { Body, H6, HSpacer, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import I18n from "../../i18n";
import { isStringNullyOrEmpty } from "../../utils/strings";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import { IOStyles } from "../core/variables/IOStyles";
import { BadgeComponent } from "../screens/BadgeComponent";

type Props = Readonly<{
  title: string;
  recipient?: string;
  description?: string;
  codiceAvviso?: string;
  error?: string;
  dateTime?: string;
  dark?: boolean;
  image?: ImageSourcePropType;
  paymentStatus?: paymentStatusType;
}>;

export type paymentStatusType = {
  color: string;
  description: string;
};

const styles = StyleSheet.create({
  column: {
    flexDirection: "column",
    flex: 1,
    paddingRight: 4
  },
  paymentOutcome: {
    flexDirection: "row",
    alignItems: "center"
  }
});

/**
 * This component displays the transaction details
 */
export const PaymentSummaryComponent = (props: Props) => {
  const renderItem = (label: string, value?: string) => {
    if (isStringNullyOrEmpty(value)) {
      return null;
    }
    return (
      <React.Fragment>
        <Body color={props.dark ? "bluegreyLight" : "bluegreyDark"}>
          {label}
        </Body>
        <Body
          weight="Semibold"
          color={props.dark ? "white" : "bluegreyDark"}
          selectable={true}
        >
          {value}
        </Body>
        <VSpacer size={16} />
      </React.Fragment>
    );
  };

  const paymentStatus = props.paymentStatus && (
    <React.Fragment>
      <View style={styles.paymentOutcome}>
        <BadgeComponent color={props.paymentStatus.color} />
        <HSpacer size={8} />
        <Body>{props.paymentStatus.description}</Body>
      </View>
      <VSpacer size={16} />
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <H6 color={props.dark ? "bluegreyLight" : "bluegrey"}>{props.title}</H6>

      {/** screen title */}
      <VSpacer size={16} />
      <ItemSeparatorComponent noPadded={true} />
      <VSpacer size={24} />

      {paymentStatus}

      <View style={IOStyles.rowSpaceBetween}>
        <View style={styles.column}>
          {renderItem(I18n.t("wallet.recipient"), props.recipient)}

          {renderItem(
            I18n.t("wallet.firstTransactionSummary.object"),
            props.description
          )}

          {renderItem(I18n.t("payment.noticeCode"), props.codiceAvviso)}
        </View>

        {props.image !== undefined && (
          <Image accessibilityIgnoresInvertColors source={props.image} />
        )}
      </View>
    </React.Fragment>
  );
};
