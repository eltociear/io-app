import { VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Content } from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import I18n from "../../i18n";
import { WithTestID } from "../../types/WithTestID";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { Body } from "../core/typography/Body";
import { H2 } from "../core/typography/H2";
import { IOStyles } from "../core/variables/IOStyles";
import { SingleButton, TwoButtonsInlineHalf } from "../ui/BlockButtons";
import FooterWithButtons from "../ui/FooterWithButtons";

type Props = WithTestID<
  Readonly<{
    avoidNavigationEvents?: boolean;
    onRetry: () => void;
    onCancel?: () => void;
    image?: ImageSourcePropType;
    text?: string;
    subText?: string;
    retryButtonTitle?: string;
    cancelButtonTitle?: string;
  }>
>;

const styles = StyleSheet.create({
  contentContainerStyle: { flexGrow: 1, justifyContent: "center" }
});

const GenericErrorComponent = (props: Props) => {
  const elementRef = React.createRef<View>();

  const renderFooterButtons = () => {
    const footerProps1: TwoButtonsInlineHalf = {
      type: "TwoButtonsInlineHalf",
      leftButton: {
        bordered: true,
        title: props.cancelButtonTitle ?? I18n.t("global.buttons.cancel"),
        onPress: props.onCancel
      },
      rightButton: {
        primary: true,
        title: props.retryButtonTitle ?? I18n.t("global.buttons.retry"),
        onPress: props.onRetry
      }
    };

    const footerProps2: SingleButton = {
      type: "SingleButton",
      leftButton: {
        primary: true,
        title: props.retryButtonTitle ?? I18n.t("global.buttons.retry"),
        onPress: props.onRetry
      }
    };

    return (
      <FooterWithButtons {...(props.onCancel ? footerProps1 : footerProps2)} />
    );
  };

  // accessible if undefined (default error subtext) or text length > 0
  const subTextAccessible = pipe(
    props.subText,
    O.fromNullable,
    O.fold(
      () => true,
      text => text.length > 0
    )
  );
  const navigation = useNavigation();
  if (props.avoidNavigationEvents !== true) {
    navigation.addListener("focus", () => {
      setAccessibilityFocus(elementRef);
    });
  }

  return (
    <>
      <Content
        bounces={false}
        testID={props.testID}
        contentContainerStyle={styles.contentContainerStyle}
      >
        <View style={IOStyles.alignCenter}>
          <VSpacer size={40} />
          <Image
            source={
              props.image ||
              require("../../../img/wallet/errors/generic-error-icon.png")
            }
          />
          <VSpacer size={40} />
          <View style={IOStyles.alignCenter}>
            <H2 weight="Bold" ref={elementRef}>
              {props.text ? props.text : I18n.t("wallet.errors.GENERIC_ERROR")}
            </H2>
            <Body accessible={subTextAccessible}>
              {props.subText !== undefined
                ? props.subText
                : I18n.t("wallet.errorTransaction.submitBugText")}
            </Body>
          </View>
          <VSpacer size={40} />
        </View>
      </Content>
      {renderFooterButtons()}
    </>
  );
};
export default GenericErrorComponent;
export type GenericErrorComponentT = ReturnType<typeof GenericErrorComponent>;
