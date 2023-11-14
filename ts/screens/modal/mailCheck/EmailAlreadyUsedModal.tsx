import * as React from "react";
import { View, SafeAreaView, StyleSheet, Modal } from "react-native";
import { Pictogram, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import I18n from "../../../i18n";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import themeVariables from "../../../theme/variables";
import { useAvoidHardwareBackButton } from "../../../utils/useAvoidHardwareBackButton";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import ROUTES from "../../../navigation/routes";

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: themeVariables.contentPaddingLarge
  },
  title: {
    textAlign: "center"
  }
});

export type Props = {
  email: string;
};

const EmailAlreadyUsedModal = (props: Props) => {
  useAvoidHardwareBackButton();
  const navigation = useNavigation();

  const continueButtonProps = {
    onPress: () =>
      navigation.navigate(ROUTES.PROFILE_NAVIGATOR, {
        screen: ROUTES.INSERT_EMAIL_SCREEN
      }),
    title: I18n.t("email.cduModal.editMail.editButton"),
    block: true
  };

  return (
    <Modal>
      <SafeAreaView style={IOStyles.flex}>
        <View style={styles.mainContainer}>
          <Pictogram name={"unrecognized"} size={120} />
          <VSpacer size={16} />
          <H3 style={styles.title}>
            {I18n.t("email.cduModal.editMail.title")}
          </H3>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>
            <Body>{I18n.t("email.cduModal.editMail.subtitleStart")}</Body>
            <Body weight="SemiBold"> {" " + props.email + " "}</Body>
            <Body>{I18n.t("email.cduModal.editMail.subtitleEnd")}</Body>
          </Body>
        </View>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      </SafeAreaView>
    </Modal>
  );
};
export default EmailAlreadyUsedModal;
