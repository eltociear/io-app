import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, SafeAreaView, StyleSheet, View } from "react-native";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../components/ui/IconFont";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import customVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { UnsubscriptionCheckListItem } from "../components/UnsubscriptionCheckListItem";
import { useConfirmationChecks } from "../hooks/useConfirmationChecks";
import { IDPayUnsubscriptionRoutes } from "../navigation/navigator";
import {
  initiativeNameSelector,
  unsubscriptionRequestSelector
} from "../store";
import { idPayUnsubscribe } from "../store/actions";

const unsubscriptionChecks: ReadonlyArray<{ title: string; subtitle: string }> =
  [
    {
      title: I18n.t("idpay.unsubscription.checks.1.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.1.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.2.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.2.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.3.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.3.content")
    },
    {
      title: I18n.t("idpay.unsubscription.checks.4.title"),
      subtitle: I18n.t("idpay.unsubscription.checks.4.content")
    }
  ];

const UnsubscriptionConfirmationScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const unsubscriptionRequest = useIOSelector(unsubscriptionRequestSelector);
  const initiativeName = useIOSelector(initiativeNameSelector);
  const isLoading = pot.isLoading(unsubscriptionRequest);

  const checks = useConfirmationChecks(unsubscriptionChecks.length);

  React.useEffect(() => {
    if (pot.isSome(unsubscriptionRequest)) {
      navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
        screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_SUCCESS
      });
    } else if (pot.isError(unsubscriptionRequest)) {
      navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
        screen: IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_FAILURE
      });
    }
  }, [navigation, unsubscriptionRequest]);

  const handleClosePress = () => navigation.pop();

  const handleConfirmPress = () => dispatch(idPayUnsubscribe.request());

  const handleCheckToggle = (index: number) => checks.toggle(index);

  const closeButton = (
    <TouchableDefaultOpacity
      onPress={handleClosePress}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont name={"io-close"} style={{ color: IOColors.bluegrey }} />
    </TouchableDefaultOpacity>
  );

  const confirmModal = useIOBottomSheetModal(
    <Body>{I18n.t("idpay.unsubscription.modal.content")}</Body>,

    I18n.t("idpay.unsubscription.modal.title", { initiativeName }),
    250,

    <FooterWithButtons
      type="TwoButtonsInlineHalf"
      leftButton={{
        onPress: () => {
          confirmModal.dismiss();
          handleConfirmPress();
        },
        block: true,
        bordered: true,
        title: I18n.t("idpay.unsubscription.button.continue"),
        danger: true
      }}
      rightButton={{
        onPress: () => {
          confirmModal.dismiss();
        },
        block: true,
        bordered: true,
        title: I18n.t("global.buttons.cancel")
      }}
    />
  );

  const body = (
    <SafeAreaView style={IOStyles.flex}>
      <View style={styles.content}>
        <H1>{I18n.t("idpay.unsubscription.title", { initiativeName })}</H1>
        <VSpacer size={16} />
        <Body>{I18n.t("idpay.unsubscription.subtitle")}</Body>
        <VSpacer size={16} />
        <FlatList
          data={unsubscriptionChecks}
          renderItem={({ item, index }) => (
            <UnsubscriptionCheckListItem
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              checked={checks.values[index]}
              onValueChange={() => handleCheckToggle(index)}
            />
          )}
        />
      </View>
      <FooterWithButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={{
          bordered: true,
          title: I18n.t("global.buttons.cancel"),
          onPress: handleClosePress
        }}
        rightButton={{
          title: I18n.t("idpay.unsubscription.button.continue"),
          onPress: confirmModal.present,
          disabled: !checks.areFullfilled,
          danger: checks.areFullfilled
        }}
      />
    </SafeAreaView>
  );

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle="Rimuovi iniziativa"
      customGoBack={closeButton}
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading}>
        {!isLoading && body}
      </LoadingSpinnerOverlay>
      {confirmModal.bottomSheet}
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: customVariables.spacerHeight,
    paddingHorizontal: customVariables.contentPadding,
    flex: 1
  }
});

export default UnsubscriptionConfirmationScreen;
