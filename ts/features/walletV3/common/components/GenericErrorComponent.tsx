import { IOPictograms, Pictogram, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { H2 } from "../../../../components/core/typography/H2";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { BlockButtonProps } from "../../../../components/ui/BlockButtons";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import { WithTestID } from "../../../../types/WithTestID";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { FooterStackButton } from "../../../bonus/bonusVacanze/components/buttons/FooterStackButtons";

type GenericErrorComponentProps = WithTestID<{
  title: string;
  pictogram: IOPictograms;
  body?: string | React.ReactNode;
  onRetry?: () => void;
  onClose?: () => void;
}>;

const styles = StyleSheet.create({
  main: {
    padding: themeVariables.contentPadding,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  textAlignCenter: {
    textAlign: "center"
  }
});

const renderBody = (body: string | React.ReactNode) =>
  pipe(
    body,
    t.string.decode,
    E.fold(
      () => body,
      bodyText => (
        <Body testID="errorScreenBody" style={styles.textAlignCenter}>
          {bodyText}
        </Body>
      )
    )
  );

/**
 * A base Error screen that displays one image, text, and bottom buttons
 * @param props
 * @constructor
 */
export const GenericErrorComponent = ({
  title,
  body,
  pictogram,
  testID,
  onRetry,
  onClose
}: GenericErrorComponentProps) => {
  const elementRef = React.createRef<Text>();
  const navigation = useNavigation();

  const retryButtonProps: BlockButtonProps = {
    testID: "WalletOnboardingRetryButtonTestID",
    block: true,
    primary: true,
    onPress: onRetry,
    title: I18n.t("features.fci.errors.buttons.retry")
  };

  const closeButtonProps: BlockButtonProps = {
    testID: "WalletOnboardingCloseButtonTestID",
    bordered: true,
    block: true,
    onPress: onClose,
    title: I18n.t("features.fci.errors.buttons.close")
  };

  const renderFooterButtons = () =>
    pipe(
      [onRetry && retryButtonProps, onClose && closeButtonProps],
      A.filterMap(O.fromNullable),
      buttons => (A.isEmpty(buttons) ? [closeButtonProps] : buttons)
    );

  navigation.addListener("focus", () => {
    setAccessibilityFocus(elementRef);
  });

  return (
    <SafeAreaView style={IOStyles.flex} testID={testID}>
      <View style={styles.main} testID="GenericErrorComponent">
        <Pictogram name={pictogram} />
        <VSpacer size={24} />
        <H2
          testID="infoScreenTitle"
          accessible
          ref={elementRef}
          style={styles.textAlignCenter}
        >
          {title}
        </H2>
        <VSpacer size={16} />
        {body && renderBody(body)}
      </View>
      <FooterStackButton buttons={renderFooterButtons()} />
    </SafeAreaView>
  );
};
